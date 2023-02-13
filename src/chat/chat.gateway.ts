import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets/interfaces';
import { Socket, Namespace } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dtos/message/createMessage.dto';
import { Room } from './entities/room.entity';
import * as cookie from 'cookie';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenPayload } from 'src/auth/interface/token.interface';
import { CreateRoomDto, FetchDto } from './dtos/room/room.dto';

@WebSocketGateway({
  transports: ['websocket'],
  namespace: 'chat',
})
@UsePipes(new ValidationPipe())
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  private rooms: Room[];
  // TODO: 변수명 더 직관적인 걸로 변경
  // { userId: [client1Id, client2Id, client3ID, ...] }
  private clientsMap: Map<number, Set<string>> = new Map();
  // { clientId: userId }
  private usersMap: Map<string, number> = new Map();
  // { roomId: { userId: unReadCount } }
  private unReadCountsMap = new Map<number, Map<number, number>>();

  makeRoomName(roomId: number) {
    return `ROOM_${roomId}`;
  }

  @WebSocketServer()
  server: Namespace;

  @SubscribeMessage('subscribe')
  async handleSubscribe(@ConnectedSocket() client: Socket) {
    const userId = this.usersMap.get(client.id);
    const rooms = await this.chatService.getAllRooms({
      where: { users: { id: userId } },
    });

    const responses = rooms.map((room) => {
      client.join(this.makeRoomName(room.id));
      console.log(`${userId} is join room: ${room.id}`);

      return { ...room, unReadCount: 10 };
    });

    return responses;
  }

  @SubscribeMessage('fetch')
  async hanedleFetch(
    @MessageBody() { roomId }: FetchDto,
    @ConnectedSocket() client: Socket,
  ) {
    // unReadCount 초기화 로직 추가.
    // TODO: 페이징 추가
    const messages = await this.chatService.getRoomMessages(roomId);

    const userId = this.usersMap.get(client.id);
    const clientIds = this.clientsMap.get(userId);

    // 각 브라우저들도 unReadCount 초기화 하라고 알림
    // TODO: 한 브라우저에서 채팅방을 보고 있으면 count 증가 X
    clientIds.forEach((clientId) => {
      this.server.to(clientId).emit('reload', roomId);
    });

    return { messages, unReadCount: 0 };
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(@MessageBody() { name, userIds }: CreateRoomDto) {
    console.log({ name, userIds });
    const room = await this.chatService.createRoom({ name, userIds });

    // 방에 초대된 유저들도 발송(나중에 제외될수도 있음)
    room.users.forEach((user) => {
      const clientIds = this.clientsMap.get(user.id);
      clientIds.forEach((clientId) => {
        this.server.to(clientId).emit('invite', { ...room, unReadCount: 0 });
      });
    });

    return room;
  }

  // @SubscribeMessage('getRooms')
  // handleGetRooms() {
  //   return this.rooms;
  // }

  @SubscribeMessage('clientSend')
  async handleSendMessage(
    @MessageBody() { text, roomId }: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.usersMap.get(client.id);

    const message = await this.chatService.createMessage(
      {
        text,
        roomId,
      },
      userId,
    );

    console.log(message);

    // TODO: 개선필요
    // message.room.users.forEach(({ id }) => {
    //   const userUnReadCount =
    //     +!(id === userId) + this.unReadCountsMap.get(roomId).get(id);
    //   this.unReadCountsMap.get(roomId).set(id, userUnReadCount);
    // });

    // console.log(this.unReadCountsMap.get(roomId).entries());

    this.server
      .to(this.makeRoomName(roomId))
      .emit('serverSend', { message, unReadCount: 0 });
    // this.server.emit('serverSend', message);

    return { message, unReadCount: 0 };
  }

  @SubscribeMessage('getUsers')
  handleGetUsers() {
    console.log(this.clientsMap);
    return this.clientsMap.keys();
  }

  async afterInit(server: Namespace) {
    this.rooms = await this.chatService.getAllRooms();
    // this.rooms.forEach((room) => {
    //   const unReadCountMap = new Map<number, number>();
    //   room.users.forEach((user) => {
    //     unReadCountMap.set(user.id, 0);
    //   });

    //   this.unReadCountsMap.set(room.id, unReadCountMap);
    // });

    console.log('init! [ROOMS]:', this.rooms);
  }

  handleDisconnect(client: Socket) {
    console.log(
      `[${client.handshake.time.toString()}]: diconnected: ${client.id}`,
    );

    const userId = this.usersMap.get(client.id);
    const clientsSet = this.clientsMap.get(userId);
    clientsSet?.delete(client.id);
    if (!clientsSet || clientsSet.size > 0) {
      return;
    }

    this.clientsMap.delete(userId);
  }

  handleConnection(client: Socket, ...args: any[]) {
    const cookieObject = cookie.parse(client.handshake.headers.cookie || '');
    const token = cookieObject['jwt'];
    if (!token) {
      console.log(
        `[${client.handshake.time.toString()}]: ${client.id} is not auth!`,
      );
      client.disconnect();
      return;
    }
    const { id: userId } = this.jwtService.decode(token) as JwtTokenPayload;

    if (!this.clientsMap.has(userId)) {
      const clientIds = new Set([client.id]);
      this.clientsMap.set(userId, clientIds);
    } else {
      this.clientsMap.get(userId).add(client.id);
    }

    this.usersMap.set(client.id, userId);

    console.log(
      `[${client.handshake.time.toString()}]: connected: ${client.id}`,
    );
  }
}

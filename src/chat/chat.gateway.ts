import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
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
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dtos/createMessage.dto';

@WebSocketGateway({
  transports: ['websocket'],
  namespace: 'chat',
})
@UsePipes(new ValidationPipe())
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('clientSend')
  async handleSendMessage(@MessageBody() { text, senderId }: CreateMessageDto) {
    console.log({ text, senderId });
    // const res: Message = {
    //   text: text,
    //   senderId: senderId,
    //   time: client.handshake.time,
    // };

    const message = await this.chatService.createMessage({ text, senderId });
    // TODO: 예외처리..?

    this.server.emit('serverSend', message);
    return message;
  }

  afterInit(server: Server) {
    console.log('init!');
  }

  handleDisconnect(client: Socket) {
    console.log(
      `[${client.handshake.time.toString()}]: diconnected: ${client.id}`,
    );
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(
      `[${client.handshake.time.toString()}]: connected: ${client.id}`,
    );
  }
}

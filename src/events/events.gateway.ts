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
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  transports: ['websocket'],
  namespace: 'chat',
  cors: {
    origin: ['http://localhost:3000'],
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    console.log(data);
    return data;
  }

  @SubscribeMessage('ping')
  handlePingPong(@MessageBody() data: string) {
    console.log('ping! pong!');
    return data;
  }

  @SubscribeMessage('clientSend')
  handleSendChat(@MessageBody() data, @ConnectedSocket() client: Socket) {
    const res = {
      text: data.text,
      sender: client.id,
      time: client.handshake.time,
    };
    console.log(res);
    this.server.emit('serverSend', res);
  }

  afterInit(server: Server) {
    console.log('init!');
  }

  handleDisconnect(client: Socket) {
    console.log(`diconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`connected: ${client.id}`);
  }
}

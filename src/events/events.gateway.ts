import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';

@WebSocketGateway(8080, { transports: ['websocket'] })
export class EventsGateway {
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
}

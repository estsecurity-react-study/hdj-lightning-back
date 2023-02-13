import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PassportJwtRequest } from 'src/auth/interface/login-request.interface';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/rooms/me')
  getMyRoom(@Req() req: PassportJwtRequest) {
    return this.chatService.getAllRooms({
      where: { users: { id: req.user.id } },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/messages/all')
  getAllMessages() {
    return this.chatService.getAllMessages();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/messages/:roomId')
  getRoomMessages(@Param('roomId') roomId: number) {
    return this.chatService.getRoomMessages(roomId);
  }
}

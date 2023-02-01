import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dtos/createMessage.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
  ) {}

  getAllMessages() {
    return this.messageRepository.find({ relations: { user: true } });
  }

  async createMessage({ text, senderId }: CreateMessageDto) {
    const sender = await this.userService.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new NotFoundException();
    }

    const message = this.messageRepository.create({ text, user: sender });
    await this.messageRepository.save(message);

    const { id, username, photo } = message.user;
    return { ...message, user: { id, username, photo } };
  }
}

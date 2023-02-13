import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateMessageDto } from './dtos/message/createMessage.dto';
import { CreateRoomDto } from './dtos/room/room.dto';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
    private readonly userService: UserService,
  ) {}

  getAllRooms(options?: FindOneOptions<Room>) {
    return this.roomsRepository.find(options);
  }

  getRoom(options?: FindOneOptions<Room>) {
    const room = this.roomsRepository.findOne(options);
    if (!room) throw new NotFoundException();

    return room;
  }

  async createRoom({ name, userIds }: CreateRoomDto) {
    const findUser = async (id: number) => {
      const user = await this.userService.findOne({ where: { id } });
      if (!user) throw new NotFoundException('not found user!');

      return user;
    };

    const users = (
      await Promise.allSettled(userIds.map((id) => findUser(id)))
    ).map((promise) =>
      promise.status === 'fulfilled' ? promise.value : undefined,
    );

    const room = this.roomsRepository.create({ name, users });
    return this.roomsRepository.save(room);
  }

  // joinRoom() {}

  // quitRoom() {}

  getAllMessages() {
    return this.messageRepository.find({ relations: { user: true } });
  }

  getRoomMessages(roomId: number) {
    return this.messageRepository.find({
      where: { room: { id: roomId } },
      relations: { user: true },
    });
  }

  async createMessage({ text, roomId }: CreateMessageDto, userId: number) {
    // TODO: 부하 괜찮..?
    const sender = await this.userService.findOne({
      where: { id: userId },
    });
    if (!sender) throw new NotFoundException('not found Sender User!');

    const room = await this.getRoom({ where: { id: roomId } });
    if (!room) throw new NotFoundException('not found room!');

    const message = this.messageRepository.create({ text, user: sender, room });
    await this.messageRepository.save(message);

    const { id, username, photo } = message.user;
    return { ...message, user: { id, username, photo } };
  }
}

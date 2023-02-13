import { PartialType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { MessageDto } from './message.dto';

export class CreateMessageDto extends PartialType(MessageDto) {
  @IsNumber()
  roomId: number;
}

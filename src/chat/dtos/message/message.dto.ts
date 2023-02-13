import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MessageDto {
  @ApiProperty({ example: 'message content' })
  @IsString()
  @IsNotEmpty()
  text: string;
}

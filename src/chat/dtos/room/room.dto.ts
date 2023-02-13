import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class RoomDto {
  @ApiProperty({ example: 'roomName' })
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  userIds: number[];
}

export class CreateRoomDto extends PartialType(RoomDto) {}

export class UpdateRoomDto extends PartialType(RoomDto) {
  @IsNumber()
  roomId: number;
}

export class FetchDto extends PickType(UpdateRoomDto, ['roomId']) {}

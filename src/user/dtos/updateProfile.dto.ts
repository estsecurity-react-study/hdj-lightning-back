import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './createUser.dto';

export class UpdateProfileDto extends OmitType(CreateUserDto, [
  'email',
  'password',
]) {}

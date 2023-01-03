import { OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto extends OmitType(CreateUserDto, ['email']) {}

import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './createUser.dto';

export class ChangePasswordDto extends PickType(CreateUserDto, ['password']) {}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Provider } from '../entities/user.entity';

export class UserDto {
  @ApiProperty({ example: 'test@test.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'username' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(Provider)
  provider: Provider;
}

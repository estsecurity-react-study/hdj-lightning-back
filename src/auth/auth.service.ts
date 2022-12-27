import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser({ email, password }: LoginDto) {
    try {
      const user = await this.userService.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException();
      }

      // TODO: fix logic
      const isValidate = await bcrypt.compare(password, user.password);
      if (!isValidate) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(user: User) {
    const payload = {
      email: user.email,
      username: user.username,
      provider: user.provider,
    };

    const token = this.jwtService.sign(payload);
    return {
      token,
    };
  }
}

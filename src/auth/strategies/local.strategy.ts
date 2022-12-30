import { Injectable } from '@nestjs/common';
import {
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common/exceptions';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Provider } from 'src/user/entities/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser({ email, password });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.provider !== Provider.LOCAL) {
      throw new UnprocessableEntityException(
        `${user.provider}을 통해 로그인 하세요.`,
      );
    }

    return user;
  }
}

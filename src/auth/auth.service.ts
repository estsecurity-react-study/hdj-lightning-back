import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';
import { Provider, User } from 'src/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtTokenPayload } from './interface/token.interface';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  setJwtTokenCookie(res: Response, token: string) {
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: this.configService.get('JWT_MAX_AGE'),
    });
  }

  removeTokens(res: Response) {
    res.cookie('jwt', '', { httpOnly: true, maxAge: 0 });
  }

  login(user: User, res: Response) {
    const payload: JwtTokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      provider: user.provider,
    };

    const token = this.jwtService.sign(payload);
    this.setJwtTokenCookie(res, token);
    return {
      token,
    };
  }

  async loginLocal({ email, password }: LoginDto) {
    try {
      const user = await this.userService.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException();
      }

      if (user.provider !== Provider.local) {
        throw new UnprocessableEntityException(
          `${user.provider}을 통해 로그인 하세요.`,
        );
      }

      // TODO: fix logic
      const isValidate = await bcrypt.compare(password, user.password);
      if (!isValidate) {
        throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}

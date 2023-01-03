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
import { Profile } from 'passport-google-oauth20';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SocialProfile } from './interface/passport-request.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
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

  async loginSocial(profile: SocialProfile, res: Response) {
    if (!profile) {
      throw new NotFoundException();
    }

    const { email, username, provider } = profile;

    let user = await this.userService.findOne({
      where: { email },
    });

    if (!user) {
      user = await this.userService.createUser(
        {
          email,
          username,
          password: '',
        },
        Provider[provider],
      );
    }

    if (user.provider !== Provider[provider]) {
      throw new UnprocessableEntityException(
        `${user.provider}을 통해 로그인 하세요.`,
      );
    }

    this.login(user, res);

    const url = this.configService.get('FRONTEND_URL');
    res.redirect(url);
  }
}

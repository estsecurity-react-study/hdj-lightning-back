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

  login(user: User) {
    const payload: JwtTokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      provider: user.provider,
    };

    const token = this.jwtService.sign(payload);
    return {
      token,
    };
  }

  login2(user: User, res: Response) {
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

  async loginGoogle(profile: Profile, res: Response) {
    if (!profile) {
      throw new NotFoundException();
    }

    const profileEmail = profile.emails[0];

    if (!profileEmail.verified) {
      throw new UnauthorizedException('not verified email.');
    }

    let user = await this.userService.findOne({
      where: { email: profileEmail.value },
    });

    if (!user) {
      user = await this.userService.createUser(
        {
          email: profileEmail.value,
          username: `${profile.name.givenName}${profile.name.familyName}`,
          password: '',
        },
        Provider.GOOGLE,
      );
    }

    if (user.provider !== Provider.GOOGLE) {
      throw new UnprocessableEntityException(
        `${user.provider}을 통해 로그인 하세요.`,
      );
    }

    const { token } = this.login2(user, res);

    // const { token } = this.login(user);

    return { token };
  }
}

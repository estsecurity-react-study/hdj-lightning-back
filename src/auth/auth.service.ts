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

  loginGoogle(profile: Profile) {
    if (!profile) {
      throw new NotFoundException();
    }

    if (!profile.emails[0].verified) {
      throw new UnauthorizedException('not verified email.');
    }

    // const payload = {
    //   email: user.emails[0].value,
    //   username: `${user.name.givenName}${user.name.familyName}`,
    //   provider: user.provider,
    // };

    return;
  }
}

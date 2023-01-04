import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { Provider } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { SocialProfile } from './interfaces/oauth-request.interface';

@Injectable()
export class OauthService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async loginSocial(profile: SocialProfile, res: Response) {
    if (!profile) {
      throw new NotFoundException();
    }

    const { email, username, provider, photo } = profile;

    let user = await this.userService.findOne({
      where: { email },
    });

    if (!user) {
      user = await this.userService.createUser(
        {
          email,
          username,
          password: '',
          photo,
        },
        Provider[provider],
      );
    }

    if (user.provider !== Provider[provider]) {
      throw new UnprocessableEntityException(
        `${user.provider}을 통해 로그인 하세요.`,
      );
    }

    this.authService.login(user, res);

    const url = this.configService.get('FRONTEND_URL');
    res.redirect(url);
  }
}

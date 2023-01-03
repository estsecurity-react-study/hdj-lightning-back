import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { Provider } from 'src/user/entities/user.entity';
import { SocialProfile } from '../interfaces/oauth-request.interface';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID'),
      callbackURL: configService.get('KAKAO_CALLBACK_URL'),
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): SocialProfile {
    console.log(profile);

    return {
      email: profile._json.email,
      username: profile.username,
      provider: Provider[profile.provider],
    };
  }
}

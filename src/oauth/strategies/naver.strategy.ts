import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver-v2';
import { Provider } from 'src/user/entities/user.entity';
import { SocialProfile } from '../interfaces/oauth-request.interface';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configServie: ConfigService) {
    super({
      clientID: configServie.get('NAVER_CLIENT_ID'),
      clientSecret: configServie.get('NAVER_CLIENT_SECRET'),
      callbackURL: configServie.get('NAVER_CALLBACK_URL'),
    });
  }

  validate(accessToken, refreshToken, profile: Profile): SocialProfile {
    console.log(profile);

    const {
      email,
      nickname: username,
      provider,
      profileImage: photo,
    } = profile;

    // TODO: naver profile image 추가
    return { email, username, provider: Provider[provider], photo };
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver-v2';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configServie: ConfigService) {
    super({
      clientID: configServie.get('NAVER_CLIENT_ID'),
      clientSecret: configServie.get('NAVER_CLIENT_SECRET'),
      callbackURL: configServie.get('NAVER_CALLBACK_URL'),
    });
  }

  validate(accessToken, refreshToken, profile: Profile) {
    console.log(profile);

    return profile;
  }
}

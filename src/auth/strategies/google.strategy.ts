import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configServie: ConfigService) {
    super({
      clientID: configServie.get('GOOGLE_CLIENT_ID'),
      clientSecret: configServie.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configServie.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile, cb) {
    console.log(accessToken);
    console.log(profile);

    return {};
  }
}

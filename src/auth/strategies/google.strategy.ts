import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

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

  validate(accessToken: string, refreshToken: string, profile: Profile, cb) {
    try {
      const { id, name, emails, provider, photos } = profile;

      return {
        id,
        name,
        emails,
        provider,
        photos,
      };
    } catch (error) {
      console.log(error);
    }
  }
}

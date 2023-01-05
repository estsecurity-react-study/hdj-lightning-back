import { Injectable } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { SocialProfile } from 'src/oauth/interfaces/oauth-request.interface';
import { Provider } from 'src/user/entities/user.entity';

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

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): SocialProfile {
    try {
      const {
        _json: { email, email_verified, name: username, picture },
        provider,
      } = profile;

      console.log(`${Provider[provider]}`, profile);

      if (!email_verified) {
        throw new ForbiddenException('not verified email');
      }

      return { email, username, provider: Provider[provider], photo: picture };
    } catch (error) {
      console.log(error);
    }
  }
}

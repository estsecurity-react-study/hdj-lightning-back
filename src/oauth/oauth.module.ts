import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { KakaoStrategy } from './strategies/kakao.strategy';

@Module({
  imports: [PassportModule, AuthModule, UserModule],
  controllers: [OauthController],
  providers: [OauthService, GoogleStrategy, NaverStrategy, KakaoStrategy],
})
export class OauthModule {}

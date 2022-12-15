import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport/dist';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, UserModule, PassportModule],
  providers: [AuthService, LocalStrategy, GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

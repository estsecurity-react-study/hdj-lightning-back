import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
import { JwtTokenPayload } from '../interface/token.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configServie: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      secretOrKey: configServie.get('JWT_SECRET'),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies['jwt'],
      ]),
    } as StrategyOptions);
  }

  validate(payload: JwtTokenPayload) {
    return this.userService.findOne({ where: { email: payload.email } });
  }
}

import { Response } from 'express';
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { GoogleAuthGuard } from 'src/oauth/guards/google-auth.guard';
import { PassportSocialRequest } from 'src/oauth/interfaces/oauth-request.interface';
import { Provider } from 'src/user/entities/user.entity';
import { NaverAuthGuard } from './guards/naver-auth.guard';

@Controller('oauth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  loginByGoogle() {
    return null;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  async googleAuthCallback(
    @Req() req: PassportSocialRequest,
    @Res() res: Response,
  ) {
    const profile = req.user;
    console.log(`${Provider[profile.provider]} auth!`, profile);

    await this.oauthService.loginSocial(profile, res);
  }

  @UseGuards(NaverAuthGuard)
  @Get('/naver/login')
  loginByNaver() {
    return null;
  }

  @UseGuards(NaverAuthGuard)
  @Get('/naver/callback')
  async naverAuthCallback(
    @Req() req: PassportSocialRequest,
    @Res() res: Response,
  ) {
    const profile = req.user;
    console.log(`${Provider[profile.provider]} auth!`, profile);

    await this.oauthService.loginSocial(profile, res);
  }
}

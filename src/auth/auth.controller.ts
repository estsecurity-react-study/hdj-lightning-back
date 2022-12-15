import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Req() req) {
    return req.user;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  loginByGoogle() {}

  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  googleAuthCallback(@Req() req, @Res() res) {
    console.log(req.user);
    return req.user;
  }
}

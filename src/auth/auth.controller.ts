import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  PassportJwtRequest,
  PassportLocalRequest,
  PassportSocialRequest,
} from 'src/auth/interface/passport-request.interface';
import { CreateUserDto } from 'src/user/dtos/createUser.dto';
import { Provider } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { NaverAuthGuard } from './guards/naver-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  regisiter(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.userService.createUser(createUserDto, Provider.local);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(
    @Req() req: PassportLocalRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    // TODO: localLogin Block
    const user = req.user;

    const { token } = this.authService.login(user, res);
    return token;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  logout(
    @Req() req: PassportJwtRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user) this.authService.removeTokens(res);
    return null;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  profile(@Req() req: PassportJwtRequest) {
    return req.user;
  }

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

    await this.authService.loginSocial(profile, res);
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

    await this.authService.loginSocial(profile, res);
  }
}

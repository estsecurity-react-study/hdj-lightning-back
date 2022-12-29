import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import {
  PassportGoogleRequest,
  PassportJwtRequest,
  PassportLocalRequest,
} from 'src/auth/interface/passport-request.interface';
import { CreateUserDto } from 'src/user/dtos/createUser.dto';
import { Provider } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/register')
  regisiter(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.userService.createUser(createUserDto, Provider.LOCAL);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(
    @Req() req: PassportLocalRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.cookie('jwt', req.user, { httpOnly: true, maxAge: 1000 * 60 * 60 });
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  logout(
    @Req() req: PassportJwtRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (req.user) res.cookie('jwt', '', { httpOnly: true, maxAge: 0 });
    return null;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  profile(@Req() req: PassportJwtRequest) {
    console.log('jwt authorized!', req.user);
    return req.user;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  loginByGoogle() {
    return null;
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  googleAuthCallback(@Req() req: PassportGoogleRequest, @Res() res: Response) {
    console.log('passport data\n', req.user);
    if (!req.user) {
      throw new NotFoundException();
    }

    // TODO: 소셜 로그인 이여도 DB에 유저 가공해서 저장.
    const user = req.user;

    if (!user.emails[0].verified) {
      throw new UnauthorizedException('not verified email.');
    }

    const payload = {
      email: user.emails[0].value,
      username: `${user.name.givenName}${user.name.familyName}`,
      provider: user.provider,
    };

    const token = this.jwtService.sign(payload);
    res.cookie('jwt', token, { httpOnly: true, maxAge: 1000 * 60 * 60 });

    const url = this.configService.get('FRONTEND_URL');
    res.redirect(url);
  }
}

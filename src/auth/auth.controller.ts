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
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
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
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  profile(@Req() req) {
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

    res.redirect(`http://localhost:3001/login/?token=${token}`);
  }
}

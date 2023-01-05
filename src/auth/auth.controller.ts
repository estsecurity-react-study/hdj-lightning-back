import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { Response } from 'express';

import { CreateUserDto } from 'src/user/dtos/createUser.dto';
import { Provider } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import {
  PassportJwtRequest,
  PassportLocalRequest,
} from './interface/login-request.interface';

@Controller('auth')
export class AuthController {
  constructor(
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
    console.log(`${Provider[user.provider]} auth!`, user);

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
}

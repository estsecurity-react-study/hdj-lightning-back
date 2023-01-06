import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PassportJwtRequest } from 'src/auth/interface/login-request.interface';
import { ChangePasswordDto } from './dtos/changePassword.dto';
import { UpdateProfileDto } from './dtos/updateProfile.dto';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne({ where: { id } });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile')
  updateUser(
    @Req() req: PassportJwtRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateUser(req.user, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile/password')
  changePassword(
    @Req() req: PassportJwtRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user, changePasswordDto);
  }
}

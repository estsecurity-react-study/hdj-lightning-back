import { Controller, Get, Param, Patch } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne({ where: { id } });
  }

  @Patch('/:id')
  updateUser(@Param('id') userId: number) {
    return;
  }
}

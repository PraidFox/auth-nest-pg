import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get('all')
  async users() {
    return this.userService.getUsers();
  }

  @Post('create')
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('all')
  async users() {
    return this.userService.getUsers();
  }

  @Get(`:login`)
  async user(@Param('login') login: string) {
    console.log(login);
    return this.userService.findUser(login);
  }
}

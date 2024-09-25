import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { genSalt, hash } from 'bcryptjs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('all')
  async getAllUsers() {
    return this.userService.getUsers();
  }

  @Get(`:id`)
  async getUserById(@Param('id') id: number) {
    return this.userService.findUserById(id);
  }

  @Post('user')
  async getUser(@Body() dto: { emailOrLogin: string; password: string }) {
    const salt = await genSalt(10);

    const password = await hash(dto.password, salt);
    console.log(password);
    const existUser = await this.userService.findUserEmailOrLogin(
      dto.emailOrLogin,
    );

    console.log(existUser);
    return existUser;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateUser(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UpdateUserDto> {
    await this.userService.updateUser(id, updateDto);
    return updateDto;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async removeUser(@Param('id') id: string) {
    return this.userService.removeUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async restoreUser(@Param('id') id: string) {
    return this.userService.restoreUser(id);
  }
}

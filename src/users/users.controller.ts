import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { Request } from 'express';
import { InfoUserInToken } from '../auth/dto/auth.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const { id } = req.user as InfoUserInToken;
    return this.userService.findUserById(id);
  }
  @Get('all')
  async getAllUsers() {
    return this.userService.getUsers();
  }

  @Get(`:id`)
  async getUserById(@Param('id') id: number) {
    return this.userService.findUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UpdateUserDto> {
    await this.userService.updateUser(id, updateDto);
    return updateDto;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/remove')
  async removeUser(@Param('id') id: string) {
    return this.userService.removeUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  async restoreUser(@Param('id') id: string) {
    return this.userService.restoreUser(id);
  }
}

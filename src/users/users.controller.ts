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
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { Request } from 'express';
import { InfoUserInToken } from '../auth/dto/auth.dto';
import { UserEntity } from './entities/user.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  @ApiResponse({ status: 200, type: UserEntity })
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    console.log('req', req);
    const { id } = req.user as InfoUserInToken;
    return this.userService.findUserById(id);
  }

  @Get('all')
  @ApiResponse({ status: 200, type: UserEntity, isArray: true })
  async getAllUsers() {
    return this.userService.getUsers();
  }

  @Get(`:id`)
  @ApiResponse({ status: 200, type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: number) {
    return await this.userService.findUserById(id);
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
  async removeUser(@Param('id') id: number) {
    return this.userService.removeUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  async restoreUser(@Param('id') id: number) {
    return this.userService.restoreUser(id);
  }
}

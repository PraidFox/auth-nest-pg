import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { Request } from 'express';
import { UserEntity } from './entities/user.entity';
import { AllUser } from './dto/response.dto';
import { InfoUserInToken } from '../auth/dto/auth.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('me')
  @ApiResponse({ status: 200, type: UserEntity })
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    const { id } = req.user as InfoUserInToken;
    return this.userService.findUserById(id);
  }

  @Get('all')
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({
    status: 200,
    type: AllUser,
  })
  @ApiQuery({ name: 'withDeleted', required: false })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAllUsers(
    @Query('withDeleted') withDeleted?: boolean,
    @Query('take') take = 0,
    @Query('skip') skip = 0,
  ) {
    return await this.userService.getUsers(take, skip, withDeleted);
  }

  @Get(`:id`)
  @ApiResponse({ status: 200, type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'Получить пользователя по id' })
  @ApiQuery({ name: 'withDeleted', required: false })
  async getUserById(
    @Param('id') id: number,
    @Query('withDeleted') withDeleted?: boolean,
  ) {
    return await this.userService.findUserById(id, withDeleted);
  }

  @Patch(':id')
  @ApiResponse({ status: 201, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User not updated' })
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: number,
    @Body() updateDto: UpdateUserDto,
  ): Promise<void> {
    await this.userService.updateUser(id, updateDto);
  }

  @Delete(':id/remove')
  @ApiResponse({ status: 200, description: 'User to not active' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User not updated' })
  @ApiOperation({ summary: 'Перевести пользователя в неактуально' })
  @UseGuards(JwtAuthGuard)
  async removeUser(@Param('id') id: number) {
    await this.userService.removeUser(id);
  }

  @Patch(':id/restore')
  @ApiResponse({ status: 200, description: 'User to active' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User not updated' })
  @ApiOperation({ summary: 'Восстановить пользователя' })
  @UseGuards(JwtAuthGuard)
  async restoreUser(@Param('id') id: number) {
    return this.userService.restoreUser(id);
  }
}

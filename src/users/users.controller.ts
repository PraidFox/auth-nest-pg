import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guards';
import { Request } from 'express';
import { UserEntity } from './entities/user.entity';
import { AllUser } from './dto/response.dto';
import { DecodedAccessToken } from '../utils/interfaces';
import { MyError } from '../utils/constants/errors';

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
    const { id } = req.user as DecodedAccessToken;
    return this.userService.getUserById(id);
  }

  @Get('mySessions')
  @ApiResponse({ status: 200, type: UserEntity })
  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @UseGuards(JwtAuthGuard)
  async getMySessions(@Req() req: Request) {
    const { id } = req.user as DecodedAccessToken;
    return this.userService.getSessionsUser(id);
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
    return await this.userService.getAllUsers(take, skip, withDeleted);
  }

  @Get(':param')
  @ApiResponse({ status: 200, type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiOperation({ summary: 'Получить пользователя по id или логину' })
  async getUser(@Param('param') param: string) {
    const isId = !isNaN(Number(param));
    if (isId) {
      return await this.userService.getUserById(Number(param));
    } else {
      const user = await this.userService.findUserEmailOrLogin(param);
      if (!user) {
        throw new NotFoundException(MyError.NOT_FOUND);
      }
      return user;
    }
  }

  @Patch(':id')
  @ApiResponse({ status: 201, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'User not updated' })
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @UseGuards(JwtAuthGuard)
  async updateUser(@Param('id') id: number, @Body() updateDto: UpdateUserDto): Promise<void> {
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

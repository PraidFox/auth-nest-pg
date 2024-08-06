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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('all')
  async getAllUsers() {
    return this.userService.getUsers();
  }

  @Get(`:login`)
  async getUser(@Param('login') login: string) {
    console.log(login);
    return this.userService.findUser(login);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
    @Req() req,
  ): Promise<UpdateUserDto> {
    console.log('id', id);
    console.log('req', req.user);
    console.log('updateDto', updateDto);
    await this.userService.updateUser(id, updateDto);
    return updateDto;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}

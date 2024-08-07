import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, type: RegisterDto })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    const { token, expire, refreshToken } = await this.authService.login(dto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
    });

    return { token, expire };
  }

  @UseGuards(JwtAuthGuard)
  @Get('refresh')
  async refresh(@Req() req: Request) {
    const oldRefreshToken = req.cookies['refreshToken'];

    if (oldRefreshToken) {
      return this.authService.refresh(oldRefreshToken);
    } else {
      throw new UnauthorizedException('Рефреш токен не найден');
    }
  }
}

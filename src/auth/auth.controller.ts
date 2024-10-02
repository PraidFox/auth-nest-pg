import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, PasswordResetDto, RegisterDto } from './dto/auth.dto';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guards';
import { RegisterResponse, TokenResponse } from './dto/responses';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ type: RegisterResponse })
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    const user = await this.authService.register(dto);
    return { id: user.id };
  }

  @ApiCreatedResponse({ type: RegisterResponse })
  @ApiOperation({ summary: 'Проверка подтверждения почты' })
  @Get('verifyEmail')
  async verifyEmail(
    @Query('') query: { token: string; userId: number },
  ): Promise<{ message: string; verified: boolean }> {
    await this.authService.verifyEmail(query.token, query.userId);

    return { message: 'Почта подтверждена', verified: true };
  }

  @ApiOperation({ summary: 'Подтверждение сброса пароля' })
  @Get('verifyResetPassword')
  async verifyResetPassword(
    @Query('') query: { token: string; userId: number },
  ): Promise<{ message: string; verified: boolean }> {
    await this.authService.verifyResetPassword(query.token, query.userId);

    return { message: 'Почта подтверждена', verified: true };
  }

  @ApiResponse({ status: 200, type: TokenResponse })
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const { token, expire, refreshToken } = await this.authService.login(dto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
    });

    return { token, expire };
  }

  @ApiResponse({ status: 200, type: TokenResponse })
  @HttpCode(200)
  @Post('resetPassword')
  async resetPassword(
    @Body() dto: PasswordResetDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const { token, expire, refreshToken } = await this.authService.login(dto);

    return { token, expire };
  }

  @ApiResponse({ status: 200, type: Boolean })
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Body() id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<boolean> {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: false,
    });
    return true;
  }

  @ApiResponse({ status: 200, type: TokenResponse })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('refreshToken')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const oldRefreshToken = req.cookies['refreshToken'];

    if (oldRefreshToken) {
      const { token, expire, refreshToken } =
        await this.authService.refresh(oldRefreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
      });

      return { token, expire };
    } else {
      throw new UnauthorizedException('Рефреш токен не найден');
    }
  }
}

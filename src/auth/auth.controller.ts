import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthDto,
  EmailOrLoginDto,
  InfoUserInToken,
  PasswordChangeDto,
  PasswordResetDto,
  RegisterDto,
} from './dto/auth.dto';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import {
  MessageResponse,
  RegisterResponse,
  TokenResponse,
  VerifyResponse,
} from './dto/responses';
import { JwtService } from '@nestjs/jwt';
import { MyError } from '../utils/constants/errors';
import { JwtAuthGuard } from './guards/jwt.guards';
import { VerifyEmailQuery } from './dto/querys';
import { CookieName } from '../utils/constants/constants';
import { SessionService } from './session.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiCreatedResponse({ type: RegisterResponse })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    const user = await this.authService.register(registerDto);
    return { id: user.id };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({ status: 200, type: TokenResponse })
  async login(
    @Req() req: Request,
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const { token, expire, refreshToken, id } =
      await this.authService.login(dto);

    const userAgent: string = req.headers['user-agent'];
    const sec: string | string[] = req.headers['sec-ch-ua-platform'];
    const ip: string = req.ip;

    const sessionMetadata = userAgent + sec + ip;
    await this.sessionService.setSession(id, refreshToken, sessionMetadata);

    res.cookie(CookieName.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: false,
    });

    return { token, expire };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Разлогинивание пользователя' })
  @ApiResponse({ status: 200 })
  async logout(
    @Body() id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    res.cookie(CookieName.REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: false,
    });
  }

  @Get('refreshToken')
  @ApiResponse({ type: TokenResponse })
  @ApiOperation({ summary: 'Генерация новых токенов' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const oldRefreshToken = req.cookies[CookieName.REFRESH_TOKEN];

    if (oldRefreshToken) {
      try {
        const { id, login } = this.jwtService.verify(oldRefreshToken);
        const { token, expire, refreshToken } = await this.authService.refresh({
          id,
          login,
        });

        res.cookie(CookieName.REFRESH_TOKEN, refreshToken, {
          httpOnly: true,
          secure: false,
        });

        return { token, expire };
      } catch (error) {
        throw new UnauthorizedException('Рефреш токен некорректный');
      }
    } else {
      throw new UnauthorizedException('Рефреш токен не найден');
    }
  }

  @Put('verifyEmail')
  @HttpCode(200)
  @ApiOperation({ summary: 'Подтверждение почты' })
  @ApiCreatedResponse({ status: 200, type: VerifyResponse })
  async verifyEmail(@Query() query: VerifyEmailQuery): Promise<VerifyResponse> {
    try {
      const { id } = this.jwtService.verify(query.token);
      await this.authService.verifyEmail(id);
    } catch (error) {
      if (error.message == 'jwt expired') {
        throw new UnauthorizedException(MyError.TOKEN_EXPIRED);
      } else if (error.message == 'invalid token') {
        throw new UnauthorizedException(MyError.TOKEN_INVALID);
      }
    }

    return { message: 'Почта подтверждена', verified: true };
  }

  @Post('sendMailResetPassword')
  @HttpCode(200)
  @ApiOperation({ summary: 'Отправка подтверждающего письма для смены пароля' })
  @ApiResponse({ status: 200, type: MessageResponse })
  async sendMailResetPassword(
    @Body() dto: EmailOrLoginDto,
  ): Promise<{ message: string }> {
    await this.authService.sendMailResetPassword(dto.emailOrLogin);
    return { message: 'Письмо отправлено' };
  }

  @Get('checkToken')
  @ApiOperation({ summary: 'Проверка токена' })
  @ApiCreatedResponse({ status: 200, type: VerifyResponse })
  async checkToken(
    @Query('') query: { token: string },
  ): Promise<VerifyResponse> {
    try {
      this.jwtService.verify(query.token);
      return { message: 'Токен корректный', verified: true };
    } catch (error) {
      if (error.message == 'jwt expired') {
        throw new UnauthorizedException(MyError.TOKEN_EXPIRED);
      } else if (error.message == 'invalid token') {
        throw new UnauthorizedException(MyError.TOKEN_INVALID);
      }
    }
  }

  @Put('resetPassword')
  @ApiOperation({ summary: 'Изменение пароля (по ссылке)' })
  async resetPassword(
    @Query('') query: { token: string },
    @Body() dto: PasswordResetDto,
  ): Promise<void> {
    try {
      const { id } = this.jwtService.verify(query.token);
      await this.authService.resetPassword(id, dto.password);
    } catch (error) {
      if (error.message == 'jwt expired') {
        throw new UnauthorizedException(MyError.TOKEN_EXPIRED);
      } else if (error.message == 'invalid token') {
        throw new UnauthorizedException(MyError.TOKEN_INVALID);
      }
    }
  }

  @Put('changePassword')
  @ApiOperation({ summary: 'Изменение пароля (зная предыдущий)' })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: Request,
    @Body() dto: PasswordChangeDto,
  ): Promise<void> {
    const { id } = req.user as InfoUserInToken;
    await this.authService.changePassword(id, dto);
  }
}

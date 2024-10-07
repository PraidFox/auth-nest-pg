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
import {
  AuthDto,
  EmailOrLoginDto,
  PasswordChangeDto,
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

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiCreatedResponse({ type: RegisterResponse })
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    const user = await this.authService.register(registerDto);
    return { id: user.id };
  }

  @ApiResponse({ status: 200, type: TokenResponse })
  @ApiOperation({ summary: 'Авторизация пользователя' })
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

  @ApiResponse({ status: 200, type: Boolean })
  @HttpCode(200)
  @ApiOperation({ summary: 'Разлогинивание пользователя' })
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
  @HttpCode(200)
  @ApiOperation({ summary: 'Генерация новых токенов' })
  @Get('refreshToken')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenResponse> {
    const oldRefreshToken = req.cookies['refreshToken'];

    if (oldRefreshToken) {
      try {
        const { id, login } = this.jwtService.verify(oldRefreshToken);

        const { token, expire, refreshToken } = await this.authService.refresh({
          id,
          login,
        });

        res.cookie('refreshToken', refreshToken, {
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

  @ApiCreatedResponse({ type: VerifyResponse })
  @ApiOperation({ summary: 'Подтверждение почты' })
  @Get('verifyEmail')
  async verifyEmail(@Query() query: VerifyEmailQuery): Promise<VerifyResponse> {
    console.log('query', query);

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

  @ApiResponse({ status: 200, type: MessageResponse })
  @HttpCode(200)
  @Post('sendMailResetPassword')
  async sendMailResetPassword(
    @Body() dto: EmailOrLoginDto,
  ): Promise<{ message: string }> {
    await this.authService.sendMailResetPassword(dto.emailOrLogin);

    return { message: 'Письмо отправлено' };
  }

  @ApiCreatedResponse({ type: VerifyResponse })
  @ApiOperation({ summary: 'Подтверждение сброса пароля' })
  @Get('verifyResetPassword')
  async verifyResetPassword(
    @Query('') query: { token: string },
  ): Promise<boolean> {
    try {
      this.jwtService.verify(query.token);
    } catch (error) {
      if (error.message == 'jwt expired') {
        throw new UnauthorizedException(MyError.TOKEN_EXPIRED);
      } else if (error.message == 'invalid token') {
        throw new UnauthorizedException(MyError.TOKEN_INVALID);
      }
    }

    return true;
  }

  // @ApiResponse({ status: 200, type: TokenResponse })
  // @HttpCode(200)
  // @Post('resetPassword')
  // async resetPassword(@Body() dto: PasswordResetDto): Promise<TokenResponse> {
  //   const { token, expire, refreshToken } = await this.authService.login(dto);
  //
  //   return { token, expire };
  // }

  @ApiResponse({ status: 200, type: TokenResponse })
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Post('changePassword')
  async changePassword(
    @Body() dto: PasswordChangeDto,
  ): Promise<PasswordChangeDto> {
    //Поиск пользователя, проверка старого пароля, изменение нового пароля
    return dto;
  }
}

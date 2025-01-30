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
import { AuthDto, PasswordChangeDto, PasswordResetDto, RegisterDto } from './dto/auth.dto';
import { ApiCreatedResponse, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { MessageResponse, RegisterResponse, TokenResponse, VerifyResponse } from './dto/responses';
import { JwtService } from '@nestjs/jwt';
import { MyError } from '../utils/constants/errors';
import { JwtAuthGuard } from './guards/jwt.guards';
import { ResetPassword, UrlVerifyEmail, VerifyEmailQuery } from './dto/querys';
import { CookieName } from '../utils/constants/constants';
import { SessionService } from './session.service';
import { UsersService } from '../users/users.service';
import { DataRefreshToken, DecodedAccessToken, DecodedRefreshToken } from '../utils/interfaces';
import { TokenService } from './token.service';

//TODO токенами для сброса пароля можно пользоваться по нескольку раз, нужно сделать так что бы раз воспользовался и всё

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiCreatedResponse({ type: RegisterResponse })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    const user = await this.authService.register(registerDto);
    await this.authService.sendVerifyEmail(user, registerDto.urlVerifyEmail);

    return { id: user.id };
  }

  @Post('sendVerifyEmail')
  @HttpCode(200)
  @ApiOperation({ summary: 'Отправка письма для верификации' })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  async sendVerifyEmail(@Req() req: Request, @Body() body: UrlVerifyEmail): Promise<string> {
    console.log('body', body);
    const { id } = req.user as DecodedAccessToken;
    const user = await this.userService.getUserById(id);
    return await this.authService.sendVerifyEmail(user, body.urlVerifyEmail);
  }

  @Get('verifyEmail')
  @HttpCode(200)
  @ApiOperation({ summary: 'Подтверждение почты' })
  @ApiCreatedResponse({ status: 200, type: VerifyResponse })
  //TODO а если пришел вызов верификации почты с аккаунта не соответствующего токену (мол токен от пользователя id=2, а пришло от id=3)
  async verifyEmail(@Query() query: VerifyEmailQuery): Promise<VerifyResponse> {
    try {
      const { id } = this.jwtService.verify(query.token);
      await this.authService.verifyEmail(id);
      return { message: 'Почта подтверждена', verified: true };
    } catch (error) {
      if (error.message == 'jwt expired') {
        throw new UnauthorizedException(MyError.TOKEN_EXPIRED);
      } else if (error.message == 'invalid token' || error.message == 'jwt malformed') {
        throw new UnauthorizedException(MyError.TOKEN_INVALID);
      }
    }
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
    const sessionMetadata = this.authService.createMetadata(req);
    const { token, expire, refreshToken } = await this.authService.login(dto, sessionMetadata);

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
  // @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const oldRefreshToken = req.cookies[CookieName.REFRESH_TOKEN];
    const { uuidSession } = this.jwtService.verify<DecodedRefreshToken>(oldRefreshToken);
    await this.sessionService.deleteSession(uuidSession);

    res.cookie(CookieName.REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: false,
    });
  }

  @Post('sendMailResetPassword')
  @HttpCode(200)
  @ApiOperation({ summary: 'Отправка подтверждающего письма для сброса пароля' })
  @ApiResponse({ status: 200, type: MessageResponse })
  //TODO убрать на проде возврат токена
  async sendMailResetPassword(@Body() dto: ResetPassword): Promise<{ message: string }> {
    const verifyToken = await this.authService.sendMailResetPassword(
      dto.emailOrLogin,
      dto.urlVerifyResetPassword,
    );
    return { message: 'Письмо отправлено, verifyToken: ' + verifyToken };
  }

  @Put('resetPassword')
  @ApiOperation({ summary: 'Изменение пароля (по ссылке)' })
  @ApiQuery({ name: 'token' })
  async resetPassword(@Query('') query: { token: string }, @Body() dto: PasswordResetDto): Promise<void> {
    const { id } = await this.tokenService.checkToken(query.token);
    await this.authService.resetPassword(id, dto.password);
  }

  @Post('sendMailChangePassword')
  @HttpCode(200)
  @ApiOperation({ summary: 'Отправка подтверждающего письма для изменения пароля' })
  @ApiResponse({ status: 200, type: MessageResponse })
  @UseGuards(JwtAuthGuard)
  //TODO убрать на проде возврат токена
  async sendMailChangePassword(
    @Req() req: Request,
    @Body() dto: PasswordChangeDto,
  ): Promise<{ message: string }> {
    const { id } = req.user as DecodedAccessToken;

    const verifyToken = await this.authService.sendMailChangePassword(id);
    await this.authService.saveTmpPassword(id, dto);

    return { message: 'Письмо отправлено verifyToken: ' + verifyToken };
  }

  @Put('changePassword')
  @ApiOperation({ summary: 'Изменение пароля (зная предыдущий)' })
  @UseGuards(JwtAuthGuard)
  async changePassword(@Query('') query: { token: string }): Promise<void> {
    const { id } = await this.tokenService.checkToken(query.token);
    await this.authService.changePassword(id);
  }

  /** Проверка токена для фронта когда приходит для смены пароля. Да бы можно было узнать не просрочился ли он и если да, то дать об этом инфу пользователю*/
  @Get('checkToken')
  @ApiOperation({ summary: 'Проверка токена' })
  @ApiCreatedResponse({ status: 200, type: VerifyResponse })
  async checkToken(@Query('') query: { token: string }): Promise<VerifyResponse> {
    return this.tokenService.checkToken(query.token);
  }

  @Get('refreshToken')
  @ApiResponse({ type: TokenResponse })
  @ApiOperation({ summary: 'Генерация новых токенов' })
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<TokenResponse> {
    const oldRefreshToken: string = req.cookies[CookieName.REFRESH_TOKEN];

    if (oldRefreshToken) {
      try {
        const { id, login, uuidSession } = this.jwtService.verify(oldRefreshToken) as DataRefreshToken;

        const sessionMetadata = this.authService.createMetadata(req);

        const { token, expire, refreshToken } = await this.authService.refresh(
          {
            id,
            login,
            uuidSession,
          },
          sessionMetadata,
        );

        res.cookie(CookieName.REFRESH_TOKEN, refreshToken, {
          httpOnly: true,
          secure: false,
        });

        return { token, expire };
      } catch (error) {
        console.log('error', error);
        if (error.message == 'invalid signature') {
          throw new UnauthorizedException('Рефреш токен некорректный');
        } else if (error.message == 'jwt expired') {
          throw new UnauthorizedException('Рефреш токен более не действительный');
        } else {
          throw new UnauthorizedException(error.message);
        }
      }
    } else {
      throw new UnauthorizedException('Рефреш токен не найден');
    }
  }
}

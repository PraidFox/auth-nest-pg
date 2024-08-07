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
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guards';
import { RegisterResponse, TokenResponse } from './dto/responses';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ type: RegisterResponse })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    const user = await this.authService.register(dto);
    return { id: user.id };
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

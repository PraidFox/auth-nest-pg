import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

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
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @Get('refresh')
  async refresh() {
    // когда писать async в контроллере???????????
    return true;
  }
}

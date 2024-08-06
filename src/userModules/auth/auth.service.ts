import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MyError } from '../../utils/constants/errors';
import { compare, genSalt, hash } from 'bcryptjs';
import { AuthDto, RegisterDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { DataForToken } from '../../utils/interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async register(dto: RegisterDto) {
    const salt = await genSalt(10);
    dto.password = await hash(dto.password, salt);

    return this.userService.createUser(dto);
  }

  async login(dto: AuthDto) {
    const existUser = await this.userService.findUserWithPassword(
      dto.emailOrLogin,
    );
    const isPasswordEquals = await compare(dto.password, existUser.password);

    if (!existUser || !isPasswordEquals) {
      throw new UnauthorizedException(MyError.WRONG_PASSWORD);
    }

    const { id, login, email } = existUser;
    const token = await this.generateToken({ id, login, email });

    return { token };
  }

  async createRefreshToken(userId: string) {
    //const tokenId = uuid();
    return this.jwtService.sign(
      { id: userId, tokenId: 123 },
      { expiresIn: '7d' },
    );
  }

  private async generateToken({ id, login, email }: DataForToken) {
    return this.jwtService.sign({ id, login, email });
  }

  // async createAccessToken(userId: string) {
  //   return this.jwtService.sign({ id: userId }, { expiresIn: '15m' });
  // }

  // private async generateRefreshToken(): Promise<Token> {
  //   return;
  // }
}

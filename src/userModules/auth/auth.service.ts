import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/user.dto';
import { MyError } from '../../utils/constants/errors';
import { compare, genSalt, hash } from 'bcryptjs';
import { AuthDto } from './dto/auth.dto';
import { TokenService } from '../token/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
  ) {}
  async register(dto: CreateUserDto) {
    const findUser = await this.userService.findUser(dto.login);
    if (findUser) {
      throw new BadRequestException(MyError.USER_ALREADY_EXISTS_LOGIN);
    }

    // findUser = await this.userService.findUserByEmail(dto.email);
    // if (findUser) {
    //   throw new BadRequestException(MyError.USER_ALREADY_EXISTS_EMAIL);
    // }

    const salt = await genSalt(10);
    dto.password = await hash(dto.password, salt);

    return this.userService.createUser(dto);
  }

  async login(dto: AuthDto) {
    const existUser = await this.userService.findUser(dto.login);

    if (!existUser) {
      throw new BadRequestException(MyError.USER_NOT_FOUND);
    }

    const isPasswordEquals = await compare(dto.password, existUser.password);
    if (!isPasswordEquals) {
      throw new BadRequestException(MyError.WRONG_PASSWORD);
    }

    const token = await this.tokenService.generateToken(existUser.login);

    return { login: existUser.login, token };
  }
}

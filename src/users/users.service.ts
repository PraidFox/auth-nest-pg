import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { MyError } from '../utils/constants/errors';

@Injectable()
export class UsersService {
  async;

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getUsers() {
    return this.usersRepository.find();
  }

  async createUser(dto: CreateUserDto) {
    try {
      return await this.usersRepository.save(dto);
    } catch (e) {
      throw new BadRequestException(MyError.USER_ALREADY_EXISTS_LOGIN);
    }
  }

  async findUserById(id: number) {
    return this.usersRepository.findOne({
      where: [{ id }],
    });
  }

  async findUserWithPassword(
    emailOrLogin: string,
  ): Promise<Pick<UserEntity, 'id' | 'login' | 'password'>> {
    return this.usersRepository.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
      select: ['id', 'login', 'password'],
    });
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    return this.usersRepository.update(id, dto);
  }

  async deleteUser(id: string) {
    return await this.usersRepository.softDelete(id);
  }

  async restoreUser(id: string) {
    return await this.usersRepository.restore(id);
  }
}

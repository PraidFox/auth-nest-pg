import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { MyError } from '../../utils/constants/errors';

@Injectable()
export class UsersService {
  async;

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  getUsers() {
    return this.usersRepository.find();
  }

  async createUser(dto: CreateUserDto) {
    try {
      const user = this.usersRepository.create(dto);
      return await this.usersRepository.save(user);
    } catch (e) {
      throw new BadRequestException(MyError.USER_ALREADY_EXISTS_LOGIN);
    }
  }

  async findUserById(id: number) {
    return this.usersRepository.findOne({
      where: [{ id }],
    });
  }

  async findUserWithPassword(emailOrLogin: string) {
    return this.usersRepository.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
      select: ['password'],
    });
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    return this.usersRepository.update(id, dto);
  }

  async deleteUser(id: string) {
    // return await this.usersRepository.softDelete(id);
    return await this.usersRepository.restore(id);
  }
}

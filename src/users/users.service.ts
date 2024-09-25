import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
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

  async findUserById(id: number, fields?: FindOneOptions<UserEntity>) {
    return this.usersRepository.findOne({
      where: [{ id }],
      ...fields,
    });
  }

  async findUser(
    where: FindOneOptions<UserEntity>,
    fields?: FindOneOptions<UserEntity>,
  ) {
    return this.usersRepository.findOne({
      ...where,
      ...fields,
    });
  }

  async findUserEmailOrLogin(emailOrLogin: string): Promise<UserEntity> {
    return this.usersRepository.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
      select: ['id', 'login', 'email', 'password'],
    });
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    return this.usersRepository.update(id, dto);
  }

  async removeUser(id: string) {
    return await this.usersRepository.softDelete(id);
  }

  async restoreUser(id: string) {
    return await this.usersRepository.restore(id);
  }
}

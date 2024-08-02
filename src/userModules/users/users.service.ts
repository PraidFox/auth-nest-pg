import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}
  getUsers() {
    return this.usersRepository.find({
      select: ['login', 'id', 'email', 'createdAt', 'updatedAt'],
    });
  }

  async createUser(dto: CreateUserDto) {
    return this.usersRepository.save(dto);
  }

  async findUser(login: string) {
    return this.usersRepository.findOne({
      where: [{ login }, { email: login }],
    });
  }

  async findUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: [{ email }],
    });
  }

  async findUserByLogin(login: string) {
    return this.usersRepository.findOne({
      where: [{ login }],
    });
  }
}

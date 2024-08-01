import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/user.dto';
import { genSalt, hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}
  getUsers() {
    return 'users';
  }

  async createUser(dto: CreateUserDto) {
    const findUser = await this.findUser(dto.login);
    if (findUser) {
      throw new BadRequestException('User already exists');
    }

    const salt = await genSalt(10);
    dto.password = await hash(dto.password, salt);

    return this.usersRepository.save(dto);
  }

  async findUser(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }
}

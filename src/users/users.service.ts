import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MyError } from '../utils/constants/errors';
import { FindOptionsSelect } from 'typeorm/find-options/FindOptionsSelect';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getAllUsers(take, skip, withDeleted = false) {
    const [users, count] = await this.usersRepository.findAndCount({
      withDeleted,
      take,
      skip,
    });
    return { users, count };
  }

  async getUserById(id: number, withDeleted: boolean = false, select?: FindOptionsSelect<UserEntity>) {
    if (!id) {
      throw new NotFoundException(MyError.FAIL_ID);
    }
    const existUser = await this.usersRepository.findOne({
      where: [{ id }],
      withDeleted,
      select,
      relations: ['sessions'],
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND_BY_ID);
    } else {
      return existUser;
    }
  }

  async getUserWithPassword(id: number): Promise<UserEntity> {
    return await this.getUserById(id, false, { password: true });
  }

  async getOnlyDeleteUsers(withDeleted = true) {
    return this.usersRepository.find({ withDeleted });
  }

  async findUserEmailOrLogin(emailOrLogin: string): Promise<UserEntity> {
    const existUser = await this.usersRepository.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND);
    } else {
      return existUser;
    }
  }

  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    try {
      return await this.usersRepository.save(dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.getUserById(id);

    const result = await this.usersRepository.update(id, dto);
    if (result.affected == 0) {
      throw new BadRequestException(MyError.UPDATE_FAILED);
    }
  }

  async updatePassword(id: number, password: string) {
    await this.getUserById(id);

    const result = await this.usersRepository.update(id, {
      password: password,
    });
    if (result.affected == 0) {
      throw new BadRequestException(MyError.UPDATE_FAILED);
    }
  }

  async removeUser(id: number) {
    await this.getUserById(id);
    const result = await this.usersRepository.softDelete(id);
    if (result.affected == 0) {
      throw new BadRequestException(MyError.DELETE_FAILED);
    }
  }

  async restoreUser(id: number) {
    await this.getUserById(id, true);
    const result = await this.usersRepository.restore(id);
    if (result.affected == 0) {
      throw new BadRequestException(MyError.RESTORE_FAILED);
    }
  }
}

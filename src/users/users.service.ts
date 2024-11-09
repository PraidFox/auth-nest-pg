import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MyError } from '../utils/constants/errors';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async getUsers(take, skip, withDeleted = false) {
    const [users, count] = await this.usersRepository.find({
      withDeleted,
      take,
      skip,
    });
    return { users, count };
  }

  async getOnlyDeleteUsers(withDeleted = true) {
    return this.usersRepository.find({ withDeleted });
  }

  async createUser(dto: CreateUserDto) {
    try {
      return await this.usersRepository.save(dto);
    } catch (e) {
      throw new BadRequestException(MyError.USER_ALREADY_EXISTS_LOGIN);
    }
  }

  async findUserById(
    id: number,
    withDeleted: boolean = false,
    fields?: FindOneOptions<UserEntity>,
  ) {
    const existUser = await this.usersRepository.findOne({
      where: [{ id }],
      withDeleted,
      ...fields,
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND_BY_ID);
    } else {
      return existUser;
    }
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
    });
  }

  async getPassword(id: number) {
    await this.findUserById(id);
    return this.usersRepository.findOne({
      where: [{ id }],
      select: ['password'],
    });
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    await this.findUserById(id);
    const result = await this.usersRepository.update(id, dto);
    if (result.affected == 0) {
      throw new BadRequestException(MyError.UPDATE_FAILED);
    }
  }

  async updatePassword(id: number, password: string) {
    await this.findUserById(id);
    const result = await this.usersRepository.update(id, {
      password: password,
    });
    if (result.affected == 0) {
      throw new BadRequestException(MyError.UPDATE_FAILED);
    }
  }

  async removeUser(id: number) {
    await this.findUserById(id);
    const result = await this.usersRepository.softDelete(id);
    if (result.affected == 0) {
      throw new BadRequestException(MyError.DELETE_FAILED);
    }
  }

  async restoreUser(id: number) {
    await this.findUserById(id, true);
    const result = await this.usersRepository.restore(id);
    if (result.affected == 0) {
      throw new BadRequestException(MyError.RESTORE_FAILED);
    }
  }
}

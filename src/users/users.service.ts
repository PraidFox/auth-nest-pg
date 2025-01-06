import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MyError } from '../utils/constants/errors';
import { FindOptionsSelect } from 'typeorm/find-options/FindOptionsSelect';
import { compare, genSalt, hash } from 'bcryptjs';
import { PasswordChangeDto } from '../auth/dto/auth.dto';

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

  async getSessionsUser(userId: number) {
    return await this.usersRepository.findOne({
      where: [{ id: userId }],
      relations: { sessions: true },
    });
  }

  async getUserById(id: number, withDeleted: boolean = false, select?: FindOptionsSelect<UserEntity>) {
    if (!id) {
      throw new NotFoundException(MyError.FAIL_ID);
    }

    const existUser = await this.usersRepository.findOne({
      where: [{ id }],
      withDeleted,
      select: { ...select },
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND_BY_ID);
    } else {
      return existUser;
    }
  }

  async getUserWithPassword(id: number): Promise<UserEntity> {
    return await this.getUserById(id, false, { password: true, tmpPassword: true });
  }

  async getOnlyDeleteUsers(withDeleted = true) {
    return this.usersRepository.find({ withDeleted });
  }

  async findUserEmailOrLogin(
    emailOrLogin: string,
    select?: FindOptionsSelect<UserEntity>,
  ): Promise<UserEntity> {
    const existUser = await this.usersRepository.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
      select: { ...select },
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND);
    } else {
      return existUser;
    }
  }

  /**Захеширует пароль и создаст нового пользователя*/
  async createUser(registerDto: CreateUserDto): Promise<UserEntity> {
    try {
      registerDto.password = await this.generateHashPassword(registerDto.password);
      return await this.usersRepository.save(registerDto);
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
    //await this.getUserById(id);

    const hashPassword = await this.generateHashPassword(password);
    const result = await this.usersRepository.update(id, {
      password: hashPassword,
      tmpPassword: null,
    });
    if (result.affected == 0) {
      throw new BadRequestException(MyError.UPDATE_FAILED);
    }
  }

  async updateTmpPassword(user: UserEntity, dto: PasswordChangeDto) {
    //await this.getUserById(id);

    const isValidPassword = await this.validatePassword(user.password, dto.currentPassword);
    if (!isValidPassword) {
      throw new UnauthorizedException(MyError.WRONG_IDENTIFICATION);
    }
    const hashPassword = await this.generateHashPassword(dto.password);

    const result = await this.usersRepository.update(user.id, {
      tmpPassword: hashPassword,
    });

    if (result.affected == 0) {
      throw new BadRequestException(MyError.UPDATE_FAILED);
    }
  }

  /**Пометить в бд пользователя как неактивным*/
  async removeUser(id: number) {
    await this.getUserById(id);
    const result = await this.usersRepository.softDelete(id);
    if (result.affected == 0) {
      throw new BadRequestException(MyError.DELETE_FAILED);
    }
  }

  /**Совсем удалить пользователя*/
  async restoreUser(id: number) {
    await this.getUserById(id, true);
    const result = await this.usersRepository.restore(id);
    if (result.affected == 0) {
      throw new BadRequestException(MyError.RESTORE_FAILED);
    }
  }

  /**
   * Сравнение паролей
   * @param {string} existingPassword - Действующий пароль пользователя
   * @param {string} passwordToCompare - Пароль для сравнения
   * @returns {boolean} - Результат сравнения пароля
   */
  async validatePassword(existingPassword: string, passwordToCompare: string): Promise<boolean> {
    return await compare(passwordToCompare, existingPassword);
  }

  /**Хешируем пароль*/
  private async generateHashPassword(password: string) {
    const salt = await genSalt(10);
    return await hash(password, salt);
  }
}

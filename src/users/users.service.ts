import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserNotPassword } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MyError } from '../utils/constants/errors';
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

  async getUserById(id: number, withDeleted: boolean = false): Promise<UserNotPassword> {
    if (!id) {
      throw new NotFoundException(MyError.FAIL_ID);
    }

    const existUser = await this.usersRepository.findOne({
      where: [{ id }],
      withDeleted,
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND_BY_ID);
    } else {
      return existUser;
    }
  }

  async getUserByIdWithPassword(id: number): Promise<UserEntity> {
    if (!id) {
      throw new NotFoundException(MyError.FAIL_ID);
    }

    const existUser = await this.usersRepository.findOne({
      where: [{ id }],
      select: this.usersRepository.metadata.propertiesMap,
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND_BY_ID);
    } else {
      return existUser;
    }
  }

  async findUserEmailOrLogin(emailOrLogin: string): Promise<UserNotPassword> {
    const existUser = await this.usersRepository.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND);
    } else {
      return existUser;
    }
  }

  async findUserByEmailOrLoginWithPassword(emailOrLogin: string): Promise<UserEntity> {
    const existUser = await this.usersRepository.findOne({
      where: [{ login: emailOrLogin }, { email: emailOrLogin }],
      select: this.usersRepository.metadata.propertiesMap,
    });

    if (!existUser) {
      throw new NotFoundException(MyError.NOT_FOUND);
    } else {
      return existUser;
    }
  }

  async getOnlyDeleteUsers(withDeleted = true) {
    return this.usersRepository.find({ withDeleted });
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

  // async getUserByIdOrEmailOrLogin(
  //   idOrEmailOrLogin: number | string,
  //   withPassword: boolean = false,
  //   withDeleted: boolean = false,
  // ): Promise<UserEntity | UserNotPassword> {
  //   const where = typeof idOrEmailOrLogin === 'number'
  //     ? [{ id: idOrEmailOrLogin }]
  //     : [{ login: idOrEmailOrLogin }, { email: idOrEmailOrLogin }];
  //
  //   const select = withPassword
  //     ? this.usersRepository.metadata.propertiesMap
  //     : undefined;
  //
  //   const existUser = await this.usersRepository.findOne({
  //     where,
  //     withDeleted,
  //     select,
  //   });
  //
  //   if (!existUser) {
  //     throw new NotFoundException(
  //       typeof idOrEmailOrLogin === 'number'
  //         ? MyError.NOT_FOUND_BY_ID
  //         : MyError.NOT_FOUND,
  //     );
  //   } else {
  //     return withPassword ? existUser : existUser as UserNotPassword;
  //   }
  // }
}

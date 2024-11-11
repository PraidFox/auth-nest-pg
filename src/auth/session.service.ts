import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSessionEntity } from './entities/user-session.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSessionEntity)
    private userSessionRepository: Repository<UserSessionEntity>,
    private userService: UsersService,
  ) {}

  async setSession(
    userId: number,
    refreshToken: string,
    sessionMetadata: string,
  ) {
    // const session = new SessionDto();
    // session.sessionMetadata = sessionMetadata;
    // session.refreshToken = refreshToken;
    // session.userId = userId;

    await this.userSessionRepository.save({
      user: { id: userId },
      sessionMetadata,
      refreshToken,
    });

    // await this.userSessionRepository.find({
    //   relations: { user: userId },
    // });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { UserSession } from '@prisma/client';
import { ISessionRepository, ISessionService } from './session.interface';
import { SessionType } from './types/session';

@Injectable()
export class SessionService implements ISessionService {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepo: ISessionRepository,
  ) {}

  async create(data: SessionType): Promise<UserSession> {
    return await this.sessionRepo.create(data);
  }

  async findOne(jti: string): Promise<UserSession | null> {
    return await this.sessionRepo.findOne(jti);
  }

  async updateToken(jti: string, token: string): Promise<UserSession> {
    return await this.sessionRepo.updateToken(jti, token);
  }

  async revokeToken(jti: string): Promise<UserSession> {
    return await this.sessionRepo.revokeToken(jti);
  }
}

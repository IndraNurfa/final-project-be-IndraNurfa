import { Injectable } from '@nestjs/common';
import { UserSession } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ISessionRepository } from './session.interface';
import { SessionType } from './types/session';

@Injectable()
export class SessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: SessionType): Promise<UserSession> {
    return await this.prisma.userSession.create({
      data,
    });
  }

  async findOne(jti: string): Promise<UserSession | null> {
    return await this.prisma.userSession.findUnique({
      where: { jti, revoked_at: null },
    });
  }

  async updateToken(jti: string, token: string): Promise<UserSession> {
    return await this.prisma.userSession.update({
      where: { jti, revoked_at: null },
      data: {
        token,
        token_expired: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }

  async revokeToken(jti: string): Promise<UserSession> {
    return await this.prisma.userSession.update({
      where: { jti, revoked_at: null },
      data: {
        revoked_at: new Date(),
      },
    });
  }
}

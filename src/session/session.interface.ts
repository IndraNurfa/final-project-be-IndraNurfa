import { UserSession } from '@prisma/client';
import { SessionType } from './types/session';

export interface ISessionService {
  create(data: SessionType): Promise<UserSession>;
  findOne(jti: string): Promise<UserSession | null>;
  updateToken(jti: string, token: string): Promise<UserSession>;
  revokeToken(jti: string): Promise<UserSession>;
}

export interface ISessionRepository {
  create(data: SessionType): Promise<UserSession>;
  findOne(jti: string): Promise<UserSession | null>;
  updateToken(jti: string, token: string): Promise<UserSession>;
  revokeToken(jti: string): Promise<UserSession>;
}

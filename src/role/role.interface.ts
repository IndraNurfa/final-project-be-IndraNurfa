import { Role } from '@prisma/client';

export interface IRoleService {
  findUserRole(): Promise<Role | null>;
  findAll(): Promise<Role[]>;
}

export interface IRoleRepository {
  findRoleUser(): Promise<Role | null>;
  findAll(): Promise<Role[]>;
}

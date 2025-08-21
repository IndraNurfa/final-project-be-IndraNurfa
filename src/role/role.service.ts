import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IRoleRepository, IRoleService } from './role.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RoleService implements IRoleService {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findUserRole(): Promise<Role | null> {
    const cacheKey = `role:user`;

    const cachedCourt = await this.cacheManager.get<Role>(cacheKey);
    if (cachedCourt) {
      return cachedCourt;
    }

    const data = await this.roleRepo.findRoleUser();
    await this.cacheManager.set(cacheKey, data, 24 * 60 * 60 * 1000);
    return data;
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepo.findAll();
  }
}

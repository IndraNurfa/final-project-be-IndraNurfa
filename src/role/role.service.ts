import { Inject, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { IRoleRepository, IRoleService } from './role.interface';

@Injectable()
export class RoleService implements IRoleService {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepo: IRoleRepository,
  ) {}

  async findUserRole(): Promise<Role | null> {
    return await this.roleRepo.findRoleUser();
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepo.findAll();
  }
}

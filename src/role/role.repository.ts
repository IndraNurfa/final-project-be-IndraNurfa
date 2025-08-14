import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IRoleRepository } from './role.interface';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findRoleUser(): Promise<Role | null> {
    return await this.prisma.role.findFirst({
      where: {
        slug: 'user',
      },
    });
  }

  async findAll(): Promise<Role[]> {
    return await this.prisma.role.findMany();
  }
}

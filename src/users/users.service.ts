import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { IRoleService } from 'src/role/role.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUsersRepository, IUsersService } from './users.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject('IRoleService')
    private readonly roleService: IRoleService,
    @Inject('IUsersRepository')
    private readonly userRepo: IUsersRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const role_user = await this.roleService.findUserRole();
    const role_id = role_user?.id;
    if (role_id === undefined) {
      throw new BadRequestException('User role not found');
    }
    dto.role_id = role_id;
    return await this.userRepo.create(dto);
  }

  async findByEmail(email: string): Promise<
    Prisma.UserGetPayload<{
      include: { role: { select: { name: true } } };
    }>
  > {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new BadRequestException('email not found');
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const cacheKey = `user:profile:${id}`;
    await this.cacheManager.del(cacheKey);

    return await this.userRepo.update(id, dto);
  }

  async findById(id: number): Promise<Prisma.UserGetPayload<{
    select: {
      id: true;
      email: true;
      full_name: true;
      role: { select: { name: true } };
    };
  }> | null> {
    const cacheKey = `user:profile:${id}`;

    const cachedUser = await this.cacheManager.get<
      Prisma.UserGetPayload<{
        select: {
          id: true;
          email: true;
          full_name: true;
          role: { select: { name: true } };
        };
      }>
    >(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepo.findById(id);

    await this.cacheManager.set(cacheKey, user, 60 * 60 * 1000);

    return user;
  }
}

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

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const cacheKey = `user:profile:${id}`;

    try {
      await this.cacheManager.del(cacheKey);

      const updatedUser = await this.userRepo.update(id, data);

      await this.cacheManager.set(cacheKey, updatedUser, 3600);

      return updatedUser;
    } catch (error) {
      await this.cacheManager.del(cacheKey);
      throw error;
    }
  }

  async findById(id: number): Promise<
    Prisma.UserGetPayload<{
      include: { role: { select: { name: true } } };
    }>
  > {
    const cacheKey = `user:profile:${id}`;

    const cachedUser = await this.cacheManager.get<
      Prisma.UserGetPayload<{
        include: { role: { select: { name: true } } };
      }>
    >(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, get from repository
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }

    // Store user in cache before returning
    await this.cacheManager.set(cacheKey, user, 60 * 60 * 1000); // Cache for 1 hour

    return user;
  }
}

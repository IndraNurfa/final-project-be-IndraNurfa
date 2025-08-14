import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { IRoleService } from 'src/role/role.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUsersRepository, IUsersService } from './users.interface';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @Inject('IRoleService')
    private readonly roleService: IRoleService,
    @Inject('IUsersRepository')
    private readonly userRepo: IUsersRepository,
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
    return await this.userRepo.update(id, data);
  }

  async findById(id: number): Promise<
    Prisma.UserGetPayload<{
      include: { role: { select: { name: true } } };
    }>
  > {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new BadRequestException('username not found');
    }

    return user;
  }
}

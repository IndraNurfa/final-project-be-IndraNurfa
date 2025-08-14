import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface IUsersService {
  create(dto: CreateUserDto): Promise<User>;
  findByEmail(username: string): Promise<
    Prisma.UserGetPayload<{
      include: { role: { select: { name: true } } };
    }>
  >;
  update(id: number, data: UpdateUserDto): Promise<User>;
  findById(id: number): Promise<
    Prisma.UserGetPayload<{
      include: { role: { select: { name: true } } };
    }>
  >;
}

export interface IUsersRepository {
  create(param: CreateUserDto): Promise<User>;
  findByEmail(username: string): Promise<Prisma.UserGetPayload<{
    include: { role: { select: { name: true } } };
  }> | null>;
  update(id: number, data: UpdateUserDto): Promise<User>;
  findById(id: number): Promise<Prisma.UserGetPayload<{
    include: { role: { select: { name: true } } };
  }> | null>;
}

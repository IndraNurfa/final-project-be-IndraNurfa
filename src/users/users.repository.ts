import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUsersRepository } from './users.interface';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        role_id: data.role_id,
      },
    });
  }

  async findByEmail(email: string): Promise<Prisma.UserGetPayload<{
    include: { role: { select: { name: true } } };
  }> | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: { name: true },
        },
      },
    });
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findById(id: number): Promise<Prisma.UserGetPayload<{
    include: { role: { select: { name: true } } };
  }> | null> {
    return await this.prisma.user.findFirst({
      where: {
        id,
      },
      include: {
        role: {
          select: { name: true },
        },
      },
    });
  }
}

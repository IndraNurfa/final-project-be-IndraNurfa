import { Injectable } from '@nestjs/common';
import { MasterCourts, MasterCourtTypes, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICourtsRepository } from './courts.interface';
import {
  UpdateMasterCourtDto,
  UpdateMasterCourtTypeDto,
} from './dto/update-court.dto';

@Injectable()
export class CourtsRepository implements ICourtsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  > {
    return await this.prisma.masterCourts.findMany({
      orderBy: { id: 'asc' },
      include: {
        master_court_types: true,
      },
    });
  }

  async findBySlug(
    slug: string,
  ): Promise<Prisma.MasterCourtsGetPayload<{
    include: { master_court_types: { select: { price: true } } };
  }> | null> {
    return await this.prisma.masterCourts.findFirst({
      where: { slug },
      include: { master_court_types: { select: { price: true } } },
    });
  }

  async findMasterType(): Promise<MasterCourtTypes[]> {
    return await this.prisma.masterCourtTypes.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async updateMasterCourt(
    id: number,
    dto: UpdateMasterCourtDto,
  ): Promise<MasterCourts> {
    return await this.prisma.masterCourts.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        court_type_id: dto.court_type_id,
      },
    });
  }

  async updateMasterType(
    id: number,
    dto: UpdateMasterCourtTypeDto,
  ): Promise<MasterCourtTypes> {
    return await this.prisma.masterCourtTypes.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
      },
    });
  }
}

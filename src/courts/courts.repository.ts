import { Injectable } from '@nestjs/common';
import { MasterCourts, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ICourtsRepository } from './courts.interface';
import { UpdateMasterCourtDto } from './dto/update-court.dto';

@Injectable()
export class CourtsRepository implements ICourtsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  > {
    return await this.prisma.masterCourts.findMany({
      include: {
        master_court_types: true,
      },
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
}

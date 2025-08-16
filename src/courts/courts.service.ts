import { Inject, Injectable } from '@nestjs/common';
import { MasterCourts, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { ICourtsRepository } from './courts.interface';
import { UpdateMasterCourtDto } from './dto/update-court.dto';

@Injectable()
export class CourtsService implements ICourtsRepository {
  constructor(
    @Inject('ICourtsRepository')
    private readonly courtRepo: ICourtsRepository,
  ) {}

  async findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  > {
    return await this.courtRepo.findAll();
  }

  async updateMasterCourt(
    id: number,
    dto: UpdateMasterCourtDto,
  ): Promise<MasterCourts> {
    if (dto.name) {
      dto.slug = slugify(dto.name, { lower: true });
    }
    return await this.courtRepo.updateMasterCourt(id, dto);
  }
}

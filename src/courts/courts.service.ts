import { Inject, Injectable } from '@nestjs/common';
import { MasterCourts, MasterCourtTypes, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { ICourtsRepository, ICourtsService } from './courts.interface';
import {
  UpdateMasterCourtDto,
  UpdateMasterCourtTypeDto,
} from './dto/update-court.dto';

@Injectable()
export class CourtsService implements ICourtsService {
  constructor(
    @Inject('ICourtsRepository')
    private readonly courtRepo: ICourtsRepository,
  ) {}

  async findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  > {
    return await this.courtRepo.findAll();
  }

  async findMasterType(): Promise<MasterCourtTypes[]> {
    return await this.courtRepo.findMasterType();
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

  async updateMasterType(
    id: number,
    dto: UpdateMasterCourtTypeDto,
  ): Promise<MasterCourtTypes> {
    return await this.courtRepo.updateMasterType(id, dto);
  }
}

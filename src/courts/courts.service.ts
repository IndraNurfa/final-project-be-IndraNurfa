import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MasterCourts, MasterCourtTypes, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  > {
    return await this.courtRepo.findAll();
  }

  async findBySlug(slug: string): Promise<Prisma.MasterCourtsGetPayload<{
    include: { master_court_types: true };
  }> | null> {
    const cacheKey = `court:slug:${slug}`;

    const cachedCourt = await this.cacheManager.get<
      Prisma.MasterCourtsGetPayload<{
        include: { master_court_types: true };
      }>
    >(cacheKey);

    if (cachedCourt) {
      return cachedCourt;
    }

    const data = await this.courtRepo.findBySlug(slug);
    await this.cacheManager.set(cacheKey, data, 24 * 60 * 60 * 1000);
    return data;
  }

  async findById(id: number): Promise<Prisma.MasterCourtsGetPayload<{
    include: { master_court_types: true };
  }> | null> {
    const cacheKey = `court:id:${id}`;

    const cachedCourt = await this.cacheManager.get<
      Prisma.MasterCourtsGetPayload<{
        include: { master_court_types: true };
      }>
    >(cacheKey);

    if (cachedCourt) {
      return cachedCourt;
    }

    const data = await this.courtRepo.findById(id);
    await this.cacheManager.set(cacheKey, data, 24 * 60 * 60 * 1000);
    return data;
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

    const cacheKey = `court:id:${id}`;
    await this.cacheManager.del(cacheKey);

    if (dto.court_type_id) {
      const courtType = await this.courtRepo.findMasterTypeById(
        dto.court_type_id,
      );
      if (!courtType) {
        throw new NotFoundException('Court type not found');
      }
    }

    return await this.courtRepo.updateMasterCourt(id, dto);
  }

  async updateMasterType(
    id: number,
    dto: UpdateMasterCourtTypeDto,
  ): Promise<MasterCourtTypes> {
    const cacheKey = `courts:type`;
    await this.cacheManager.del(cacheKey);

    return await this.courtRepo.updateMasterType(id, dto);
  }
}

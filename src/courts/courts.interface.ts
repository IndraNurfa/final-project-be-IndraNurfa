import { MasterCourts, MasterCourtTypes, Prisma } from '@prisma/client';
import {
  UpdateMasterCourtDto,
  UpdateMasterCourtTypeDto,
} from './dto/update-court.dto';

export interface ICourtsService {
  findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  >;
  findMasterType(): Promise<MasterCourtTypes[]>;
  findBySlug(slug: string): Promise<Prisma.MasterCourtsGetPayload<{
    include: { master_court_types: true };
  }> | null>;
  findById(id: number): Promise<Prisma.MasterCourtsGetPayload<{
    include: { master_court_types: true };
  }> | null>;
  updateMasterCourt(
    id: number,
    dto: UpdateMasterCourtDto,
  ): Promise<MasterCourts>;
  updateMasterType(
    id: number,
    dto: UpdateMasterCourtTypeDto,
  ): Promise<MasterCourtTypes>;
}

export interface ICourtsRepository {
  findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  >;
  findBySlug(slug: string): Promise<Prisma.MasterCourtsGetPayload<{
    include: { master_court_types: true };
  }> | null>;
  findById(id: number): Promise<Prisma.MasterCourtsGetPayload<{
    include: { master_court_types: true };
  }> | null>;
  findMasterType(): Promise<MasterCourtTypes[]>;
  updateMasterCourt(
    id: number,
    dto: UpdateMasterCourtDto,
  ): Promise<MasterCourts>;
  updateMasterType(
    id: number,
    dto: UpdateMasterCourtTypeDto,
  ): Promise<MasterCourtTypes>;
}

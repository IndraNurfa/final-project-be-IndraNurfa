import { MasterCourts, Prisma } from '@prisma/client';
import { UpdateMasterCourtDto } from './dto/update-court.dto';

export interface ICourtsService {
  findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  >;
  updateMasterCourt(
    id: number,
    dto: UpdateMasterCourtDto,
  ): Promise<MasterCourts>;
}

export interface ICourtsRepository {
  findAll(): Promise<
    Prisma.MasterCourtsGetPayload<{ include: { master_court_types: true } }>[]
  >;
  updateMasterCourt(
    id: number,
    dto: UpdateMasterCourtDto,
  ): Promise<MasterCourts>;
}

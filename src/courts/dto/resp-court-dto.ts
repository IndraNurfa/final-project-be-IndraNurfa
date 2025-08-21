import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseCourtDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Alpha Court 1' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'alpha-court-1' })
  @Expose()
  slug: string;

  @ApiProperty({ example: 1 })
  @Expose()
  court_type_id: number;

  @ApiProperty({ example: true })
  @Expose()
  is_active: boolean;

  @ApiProperty({ example: '2025-08-18T01:52:51.603Z' })
  @Expose()
  created_at: string;

  @ApiProperty({ example: '2025-08-18T01:52:51.603Z' })
  @Expose()
  updated_at: string;
}

export class ResponseMasterCourtTypeDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'ALPHA' })
  @Expose()
  name: string;

  @ApiProperty({ example: '600000' })
  @Expose()
  price: string;

  @ApiProperty({ example: '2025-08-18T01:52:51.600Z' })
  @Expose()
  created_at: string;

  @ApiProperty({ example: '2025-08-18T01:52:51.600Z' })
  @Expose()
  updated_at: string;
}

export class ResponseCourtDto extends BaseResponseCourtDto {
  @ApiProperty({ type: ResponseMasterCourtTypeDto })
  @Expose()
  @Type(() => ResponseMasterCourtTypeDto)
  master_court_types: ResponseMasterCourtTypeDto;
}

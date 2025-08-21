import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseRoleDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Admin' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'admin' })
  @Expose()
  slug: string;

  @ApiProperty({ example: true })
  @Expose()
  is_active: boolean;

  @ApiProperty({ example: '2025-08-18T01:52:51.509Z' })
  @Expose()
  created_at: string;

  @ApiProperty({ example: '2025-08-18T01:52:51.509Z' })
  @Expose()
  updated_at: string;
}

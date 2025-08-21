import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateMasterCourtTypeDto {
  @ApiPropertyOptional({
    example: 'ALPHA',
    maxLength: 255,
    description: 'Court type name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 600000,
    minimum: 0,
    description: 'Court type price',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

export class UpdateMasterCourtDto {
  @ApiPropertyOptional({
    example: 'Alpha Court 1',
    maxLength: 255,
    description: 'Court name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 'alpha-court-1',
    description: 'Court slug (excluded from update)',
  })
  @IsOptional()
  @Exclude()
  slug?: string;

  @ApiPropertyOptional({ example: 1, description: 'Court type ID' })
  @IsOptional()
  @IsInt()
  court_type_id?: number;
}

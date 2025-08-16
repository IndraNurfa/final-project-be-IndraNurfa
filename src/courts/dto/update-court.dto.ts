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
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;
}

export class UpdateMasterCourtDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @Exclude()
  slug?: string;

  @IsOptional()
  @IsInt()
  court_type_id?: number;
}

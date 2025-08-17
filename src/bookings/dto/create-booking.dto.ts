import { BookingStatus, CreatedByType } from '@prisma/client';
import { Exclude } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  court_slug: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status: string;

  @IsNotEmpty()
  @IsDateString()
  booking_date: string;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in HH:mm format',
  })
  start_time: string;

  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end_time must be in HH:mm format',
  })
  end_time: string;

  @IsOptional()
  @IsString()
  name: string;
}

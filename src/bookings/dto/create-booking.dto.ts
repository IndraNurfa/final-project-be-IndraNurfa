import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: 'alpha-court-1',
    description: 'Court slug identifier',
  })
  @IsNotEmpty()
  @IsString()
  court_slug: string;

  @ApiPropertyOptional({ enum: BookingStatus, description: 'Booking status' })
  @IsOptional()
  @IsEnum(BookingStatus)
  status: string;

  @ApiProperty({
    example: '2025-08-21',
    description: 'Booking date in YYYY-MM-DD format',
  })
  @IsNotEmpty()
  @IsDateString()
  booking_date: string;

  @ApiProperty({ example: '08:00', description: 'Start time in HH:mm format' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in HH:mm format',
  })
  start_time: string;

  @ApiProperty({ example: '12:00', description: 'End time in HH:mm format' })
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end_time must be in HH:mm format',
  })
  end_time: string;

  @ApiProperty({ example: 'Budi', description: 'Name for the booking' })
  @IsOptional()
  @IsString()
  name: string;
}

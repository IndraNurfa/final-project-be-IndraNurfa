import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class BaseResponseBookingDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'cad254a0-a14b-43d9-b599-c64b1ebd5216' })
  @Expose()
  uuid: string;

  @ApiProperty({ example: 'ADMIN' })
  @Expose()
  created_by_type: string;

  @ApiProperty({ example: 1 })
  @Expose()
  user_id: number;

  @ApiProperty({ example: 1 })
  @Expose()
  court_id: number;

  @ApiProperty({ example: 'CONFIRMED' })
  @Expose()
  status: string;

  @ApiProperty({ example: '2025-08-22T00:00:00.000Z' })
  @Expose()
  booking_date: string;

  @ApiProperty({ example: '2025-08-22T00:00:00.000Z' })
  @Expose()
  start_time: string;

  @ApiProperty({ example: '2025-08-22T01:00:00.000Z' })
  @Expose()
  end_time: string;

  @ApiProperty({ example: null, nullable: true })
  @Expose()
  cancel_reason: string | null;

  @ApiProperty({ example: '2025-08-21T08:45:52.247Z' })
  @Expose()
  created_at: string;

  @ApiProperty({ example: '2025-08-21T08:45:52.247Z' })
  @Expose()
  updated_at: string;
}

class AvailableSlotDto {
  @ApiProperty({ example: '07:00' })
  @Expose()
  start_time: string;

  @ApiProperty({ example: '08:00' })
  @Expose()
  end_time: string;

  @ApiProperty({ example: false })
  @Expose()
  is_available: boolean;
}

export class ResponseAvailableDto {
  @ApiProperty({ example: '2025-08-22' })
  @Expose()
  date: string;

  @ApiProperty({ example: 'alpha-court-1' })
  @Expose()
  court: string;

  @ApiProperty({ example: 600000 })
  @Expose()
  price: number;

  @ApiProperty({ type: [AvailableSlotDto] })
  @Expose()
  @Type(() => AvailableSlotDto)
  available_slots: AvailableSlotDto[];
}

class BookingDetailDto {
  @ApiProperty({ example: 4 })
  @Expose()
  id: number;

  @ApiProperty({ example: 4 })
  @Expose()
  booking_id: number;

  @ApiProperty({ example: 'sule' })
  @Expose()
  name: string;

  @ApiProperty({ example: '600000' })
  @Expose()
  total_price: string;

  @ApiProperty({ example: 1 })
  @Expose()
  total_hour: number;

  @ApiProperty({ example: '2025-08-18T05:42:57.182Z' })
  @Expose()
  created_at: string;

  @ApiProperty({ example: '2025-08-18T14:13:38.573Z' })
  @Expose()
  updated_at: string;
}

export class ResponseBookingWithDetailDto extends BaseResponseBookingDto {
  @ApiProperty({ type: BookingDetailDto })
  @Expose()
  @Type(() => BookingDetailDto)
  details: BookingDetailDto;
}

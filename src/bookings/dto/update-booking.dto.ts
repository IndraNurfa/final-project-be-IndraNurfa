import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  booking_date: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'start_time must be in HH:mm format',
  })
  start_time: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'end_time must be in HH:mm format',
  })
  end_time: string;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

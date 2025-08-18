import { Prisma } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AvailabilityResponse } from './entities/booking.entity';

export interface IBookingsService {
  create(dto: CreateBookingDto, user_id: number, role: string);
  findByUUID(uuid: string);
  findAvailable(
    court_slug: string,
    date: string,
  ): Promise<AvailabilityResponse>;
}

export interface IBookingsRepository {
  create(
    b: Prisma.BookingUncheckedCreateInput,
    name: string,
    total_price: number,
    total_hour: number,
  );
  findBookingByCourtIdAndDate(court_id: number, booking_date: Date);
  findByUUID(uuid: string);
}

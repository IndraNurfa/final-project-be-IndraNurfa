import { Booking, Prisma } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  AvailabilityResponse,
  UpdateBookingType,
} from './entities/booking.entity';
import { CancelBookingDto, UpdateBookingDto } from './dto/update-booking.dto';

export interface IBookingsService {
  create(dto: CreateBookingDto, user_id: number, role: string);
  findByUUID(
    uuid: string,
  ): Promise<Prisma.BookingGetPayload<{ include: { details: true } }>>;
  findAvailable(
    court_slug: string,
    date: string,
  ): Promise<AvailabilityResponse>;
  updateBooking(
    uuid: string,
    dto: UpdateBookingDto,
    user_id: number,
    role: string,
  ): Promise<Booking>;
  cancel(uuid: string, dto: CancelBookingDto);
  confirm(uuid: string);
  adminDashboard(page: number);
  findByUserId(
    user_id: number,
    page: number,
  ): Promise<Prisma.BookingGetPayload<{ include: { details: true } }>[]>;
}

export interface IBookingsRepository {
  create(
    b: Prisma.BookingUncheckedCreateInput,
    name: string,
    total_price: number,
    total_hour: number,
  ): Promise<Booking>;
  findBookingByCourtIdAndDate(
    court_id: number,
    booking_date: Date,
  ): Promise<Booking[]>;
  findByUUID(
    uuid: string,
  ): Promise<Prisma.BookingGetPayload<{ include: { details: true } }>>;
  updateBooking(data: UpdateBookingType): Promise<Booking>;
  confirm(uuid: string): Promise<Booking>;
  cancel(uuid: string, resason: string): Promise<Booking>;
  adminDashboard(skip: number, take: number): Promise<Booking[]>;
  findByUserId(
    user_id: number,
    skip: number,
    take: number,
  ): Promise<Prisma.BookingGetPayload<{ include: { details: true } }>[]>;
}

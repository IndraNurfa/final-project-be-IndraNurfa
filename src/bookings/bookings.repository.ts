import { ConflictException, Injectable } from '@nestjs/common';
import { Booking, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IBookingsRepository } from './bookings.interface';
import { UpdateBookingType } from './entities/booking.entity';

@Injectable()
export class BookingsRepository implements IBookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async checkOverlap(
    prisma: Prisma.TransactionClient,
    court_id: number,
    booking_date: string | Date,
    startTime: string | Date,
    endTime: string | Date,
  ) {
    return await prisma.booking.findFirst({
      where: {
        court_id,
        booking_date,
        status: { in: ['PENDING', 'CONFIRMED'] },
        AND: [{ start_time: { lt: endTime } }, { end_time: { gt: startTime } }],
      },
    });
  }

  async create(
    b: Prisma.BookingUncheckedCreateInput,
    name: string,
    total_price: number,
    total_hour: number,
  ): Promise<Booking> {
    return await this.prisma.$transaction(async (tx) => {
      const overlap = await this.checkOverlap(
        tx,
        b.court_id,
        b.booking_date,
        b.start_time,
        b.end_time,
      );

      if (overlap) {
        throw new ConflictException('Court already booked');
      }

      // 1. Create booking
      const booking = await tx.booking.create({
        data: {
          uuid: b.uuid,
          created_by_type: b.created_by_type,
          user_id: b.user_id,
          court_id: b.court_id,
          status: b.status ?? 'PENDING',
          booking_date: b.booking_date,
          start_time: b.start_time,
          end_time: b.end_time,
        },
      });

      // 2. Create booking detail
      await tx.bookingDetail.create({
        data: {
          booking_id: booking.id,
          name,
          total_price,
          total_hour,
        },
      });

      // 3. Create booking history
      await tx.bookingHistory.create({
        data: {
          booking_id: booking.id,
          status: 'PENDING',
        },
      });

      if (b.status !== 'PENDING') {
        await tx.bookingHistory.create({
          data: {
            booking_id: booking.id,
            status: b.status ?? 'CANCELED',
          },
        });
      }

      return booking;
    });
  }

  async findBookingByCourtIdAndDate(
    court_id: number,
    booking_date: Date,
  ): Promise<Booking[]> {
    return await this.prisma.booking.findMany({
      where: {
        court_id,
        booking_date,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { start_time: 'asc' },
    });
  }

  async findByUUID(
    uuid: string,
  ): Promise<Prisma.BookingGetPayload<{ include: { details: true } }>> {
    return await this.prisma.booking.findFirstOrThrow({
      where: { uuid },
      include: { details: true },
    });
  }

  async updateBooking(data: UpdateBookingType): Promise<Booking> {
    return await this.prisma.$transaction(async (tx) => {
      const overlap = await this.checkOverlap(
        tx,
        data.court_id,
        data.booking_date,
        data.start_time,
        data.end_time,
      );

      if (overlap) {
        throw new ConflictException('Court already booked');
      }

      const booking = await tx.booking.update({
        where: { uuid: data.uuid },
        data: {
          booking_date: data.booking_date,
          start_time: data.start_time,
          end_time: data.end_time,
        },
      });

      await tx.bookingDetail.update({
        where: { booking_id: booking.id },
        data: { total_price: data.total_price, total_hour: data.total_hour },
      });

      return booking;
    });
  }

  async cancel(uuid: string, resason: string): Promise<Booking> {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { uuid },
        data: {
          status: 'CANCELED',
          cancel_reason: resason,
        },
      });
      await tx.bookingHistory.create({
        data: {
          booking_id: booking.id,
          status: 'CANCELED',
        },
      });
      return booking;
    });
  }

  async confirm(uuid: string): Promise<Booking> {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { uuid },
        data: {
          status: 'CONFIRMED',
        },
      });
      await tx.bookingHistory.create({
        data: {
          booking_id: booking.id,
          status: 'CONFIRMED',
        },
      });
      return booking;
    });
  }

  async adminDashboard(skip: number, take: number): Promise<Booking[]> {
    return await this.prisma.booking.findMany({
      skip,
      take,
      orderBy: { id: 'desc' },
    });
  }

  async findByUserId(
    user_id: number,
    skip: number,
    take: number,
  ): Promise<Prisma.BookingGetPayload<{ include: { details: true } }>[]> {
    return await this.prisma.booking.findMany({
      skip,
      take,
      where: { user_id, created_by_type: 'USER' },
      include: { details: true },
      orderBy: { id: 'desc' },
    });
  }
}

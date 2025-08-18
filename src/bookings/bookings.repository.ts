import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IBookingsRepository } from './bookings.interface';

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
        AND: [
          { start_time: { lte: endTime } },
          { end_time: { gte: startTime } },
        ],
      },
    });
  }

  async create(
    b: Prisma.BookingUncheckedCreateInput,
    name: string,
    total_price: number,
    total_hour: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const overlap = await tx.booking.findFirst({
        where: {
          court_id: b.court_id,
          booking_date: b.booking_date,
          status: { in: ['PENDING', 'CONFIRMED'] },
          NOT: [
            {
              OR: [
                { end_time: { lte: b.start_time } }, // booking ends before new starts
                { start_time: { gte: b.end_time } }, // booking starts after new ends
              ],
            },
          ],
        },
      });

      // const overlap = await this.checkOverlap(
      //   tx,
      //   b.court_id,
      //   b.booking_date,
      //   b.start_time,
      //   b.end_time,
      // );

      if (overlap) {
        throw new Error('Court already booked');
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

  async findBookingByCourtIdAndDate(court_id: number, booking_date: Date) {
    return await this.prisma.booking.findMany({
      where: {
        court_id,
        booking_date,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      orderBy: { start_time: 'asc' },
    });
  }

  async findByUUID(uuid: string) {
    return await this.prisma.booking.findFirst({
      where: { uuid },
      include: { details: true },
    });
  }
}

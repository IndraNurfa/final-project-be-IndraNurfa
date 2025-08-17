import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ICourtsService } from 'src/courts/courts.interface';
import { IBookingsRepository, IBookingsService } from './bookings.interface';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService implements IBookingsService {
  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingsRepo: IBookingsRepository,
    @Inject('ICourtsService')
    private readonly courtsService: ICourtsService,
  ) {}

  private getHourDifference(end_time, start_time): number | false {
    const [h1, m1] = end_time.split(':').map(Number);
    const [h2, m2] = start_time.split(':').map(Number);

    if (m1 !== 0 || m2 !== 0) {
      return false;
    }

    return h1 - h2;
  }

  async create(dto: CreateBookingDto, user_id: number, role: string) {
    const court = await this.courtsService.findBySlug(dto.court_slug);
    if (!court) {
      throw new BadRequestException('Court not found');
    }

    const book_date = new Date(dto.booking_date);
    const book_start = new Date(`1970-01-01T${dto.start_time}`);
    const book_end = new Date(`1970-01-01T${dto.end_time}`);

    const total_hour = this.getHourDifference(dto.end_time, dto.start_time);

    if (total_hour === false || total_hour <= 0) {
      throw new BadRequestException('start time or end time not valid');
    }

    const price = Number(total_hour) * Number(court.master_court_types.price);

    const created_by_type = role === 'Admin' ? 'ADMIN' : 'USER';
    const CurStatus = role === 'Admin' ? 'CONFIRMED' : 'PENDING';

    const b: Prisma.BookingUncheckedCreateInput = {
      uuid: randomUUID(),
      created_by_type: created_by_type,
      user_id: user_id,
      court_id: court.id,
      status: CurStatus,
      booking_date: book_date,
      start_time: book_start,
      end_time: book_end,
    };

    return this.bookingsRepo.create(b, dto.name, price, total_hour);
  }

  // findAll() {
  //   return `This action returns all bookings`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} booking`;
  // }

  // update(id: number, updateBookingDto: UpdateBookingDto) {
  //   return `This action updates a #${id} booking`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} booking`;
  // }
}

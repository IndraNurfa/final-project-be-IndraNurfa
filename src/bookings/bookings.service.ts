import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ICourtsService } from 'src/courts/courts.interface';
import { IBookingsRepository, IBookingsService } from './bookings.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { AvailabilityResponse, AvailableSlot } from './entities/booking.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class BookingsService implements IBookingsService {
  private readonly TIMEZONE = 'Asia/Bangkok';
  private readonly BUSINESS_START_HOUR = 7;
  private readonly BUSINESS_END_HOUR = 22;

  constructor(
    @Inject('IBookingsRepository')
    private readonly bookingsRepo: IBookingsRepository,
    @Inject('ICourtsService')
    private readonly courtsService: ICourtsService,
  ) {}

  private getHourDifference(end_time, start_time): number | false {
    const [h1, m1] = end_time.split(':').map(Number);
    const [h2, m2] = start_time.split(':').map(Number);

    if (
      m1 !== 0 ||
      m2 !== 0 ||
      h1 > this.BUSINESS_END_HOUR ||
      h2 < this.BUSINESS_START_HOUR
    ) {
      return false;
    }

    return h1 - h2;
  }

  private generateTimeSlots(): AvailableSlot[] {
    const slots: AvailableSlot[] = [];

    for (
      let hour = this.BUSINESS_START_HOUR;
      hour < this.BUSINESS_END_HOUR;
      hour++
    ) {
      const startTime = hour.toString().padStart(2, '0') + ':00';
      const endTime = (hour + 1).toString().padStart(2, '0') + ':00';

      slots.push({
        start_time: startTime,
        end_time: endTime,
        is_available: true,
      });
    }

    return slots;
  }

  private markSlotAvailability(
    allSlots: AvailableSlot[],
    existingBookings: { start_time: Date; end_time: Date }[],
  ): AvailableSlot[] {
    return allSlots.map((slot) => {
      // Parse slot time to minutes from start of day
      const [slotStartHour, slotStartMin] = slot.start_time
        .split(':')
        .map(Number);
      const [slotEndHour, slotEndMin] = slot.end_time.split(':').map(Number);
      const slotStartMinutes = slotStartHour * 60 + slotStartMin;
      const slotEndMinutes = slotEndHour * 60 + slotEndMin;

      // Check if this slot conflicts with any existing booking
      const isBooked = existingBookings.some((booking) => {
        // Convert UTC booking times to local timezone
        const bookingStart = dayjs.utc(booking.start_time).tz(this.TIMEZONE);
        const bookingEnd = dayjs.utc(booking.end_time).tz(this.TIMEZONE);

        // Get booking time in minutes from start of day
        const bookingStartMinutes =
          bookingStart.hour() * 60 + bookingStart.minute();
        const bookingEndMinutes = bookingEnd.hour() * 60 + bookingEnd.minute();

        // Check for overlap using standard interval overlap formula
        return (
          slotStartMinutes < bookingEndMinutes &&
          slotEndMinutes > bookingStartMinutes
        );
      });

      return {
        ...slot,
        is_available: !isBooked,
      };
    });
  }

  async create(dto: CreateBookingDto, user_id: number, role: string) {
    const court = await this.courtsService.findBySlug(dto.court_slug);
    if (!court) {
      throw new BadRequestException(
        `Court with slug '${dto.court_slug}' not found`,
      );
    }

    const book_date = new Date(dto.booking_date);
    const book_start = new Date(`${dto.booking_date}T${dto.start_time}`);
    const book_end = new Date(`${dto.booking_date}T${dto.end_time}`);

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

  async findAvailable(court_slug: string, date: string): Promise<AvailabilityResponse> {
    // Validate date format
    if (!dayjs(date, 'YYYY-MM-DD', true).isValid()) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    // Find court by slug
    const court = await this.courtsService.findBySlug(court_slug);

    if (!court) {
      throw new NotFoundException(`Court with slug '${court_slug}' not found`);
    }

    // Get all possible time slots for the day
    const allSlots = this.generateTimeSlots();

    // Get existing bookings for the date and court
    const existingBookings =
      await this.bookingsRepo.findBookingByCourtIdAndDate(
        court.id,
        new Date(date),
      );

    // Mark slots as available/unavailable
    const availableSlots = this.markSlotAvailability(
      allSlots,
      existingBookings,
    );

    return {
      date,
      court: court_slug,
      available_slots: availableSlots,
    };
  }

  async findByUUID(uuid: string) {
    return await this.bookingsRepo.findByUUID(uuid);
  }

  // update(id: number, updateBookingDto: UpdateBookingDto) {
  //   return `This action updates a #${id} booking`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} booking`;
  // }
}

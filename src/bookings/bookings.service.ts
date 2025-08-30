import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Booking, Prisma } from '@prisma/client';
import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { ICourtsService } from 'src/courts/courts.interface';
import { IBookingsRepository, IBookingsService } from './bookings.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto, UpdateBookingDto } from './dto/update-booking.dto';
import {
  AvailabilityResponse,
  AvailableSlot,
  UpdateBookingType,
} from './entities/booking.entity';

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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getHourDifference(
    end_time: string,
    start_time: string,
  ): number | false {
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
        const startTimeUTC = new Date(booking.start_time);
        const endTimeUTC = new Date(booking.end_time);

        const bookingStartMinutes =
          startTimeUTC.getUTCHours() * 60 + startTimeUTC.getUTCMinutes();
        const bookingEndMinutes =
          endTimeUTC.getUTCHours() * 60 + endTimeUTC.getUTCMinutes();

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

    const data = await this.bookingsRepo.create(b, dto.name, price, total_hour);

    if (data) {
      const cacheKey = `booking:available:${dto.court_slug}:${dto.booking_date}`;
      await this.cacheManager.del(cacheKey);
    }

    return data;
  }

  async findAvailable(
    court_slug: string,
    date: string,
  ): Promise<AvailabilityResponse> {
    // Validate date format
    if (!dayjs(date, 'YYYY-MM-DD', true).isValid()) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    const cacheKey = `booking:available:${court_slug}:${date}`;

    const cachedBooking =
      await this.cacheManager.get<AvailabilityResponse>(cacheKey);

    if (cachedBooking) {
      return cachedBooking;
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

    const data = {
      date,
      court: court_slug,
      price: Number(court.master_court_types.price),
      available_slots: availableSlots,
    };

    await this.cacheManager.set<AvailabilityResponse>(
      cacheKey,
      data,
      2 * 60 * 1000,
    );

    return data;
  }

  async findByUUID(uuid: string): Promise<
    Prisma.BookingGetPayload<{
      include: {
        details: true;
        court: { select: { name: true } };
      };
    }>
  > {
    const cacheKey = `booking:uuid:${uuid}`;
    const cachedBooking = await this.cacheManager.get<
      Prisma.BookingGetPayload<{
        include: {
          details: true;
          court: { select: { name: true } };
        };
      }>
    >(cacheKey);

    if (cachedBooking) {
      return cachedBooking;
    }

    const data = await this.bookingsRepo.findByUUID(uuid);
    await this.cacheManager.set(cacheKey, data, 5 * 60 * 1000);
    return data;
  }

  async updateBooking(
    uuid: string,
    dto: UpdateBookingDto,
    user_id: number,
    role: string,
  ): Promise<Booking> {
    const currentBooking = await this.bookingsRepo.findByUUID(uuid);
    if (!currentBooking) {
      throw new NotFoundException(`booking ${uuid} not found`);
    }
    if (currentBooking.status !== 'PENDING') {
      throw new BadRequestException(`booking ${uuid} cant updated`);
    }
    if (role !== 'Admin' && currentBooking.user_id !== user_id) {
      throw new BadRequestException(`this user cant update booking ${uuid}`);
    }

    const court = await this.courtsService.findById(currentBooking.court_id);
    if (!court) {
      throw new BadRequestException(
        `Court with slug '${currentBooking.court_id}' not found`,
      );
    }

    const book_date = new Date(dto.booking_date);

    // Create datetime objects in local timezone (database stores local times)
    const book_start = dayjs
      .tz(`${dto.booking_date} ${dto.start_time}`, this.TIMEZONE)
      .toDate();
    const book_end = dayjs
      .tz(`${dto.booking_date} ${dto.end_time}`, this.TIMEZONE)
      .toDate();

    const total_hour = this.getHourDifference(dto.end_time, dto.start_time);

    if (total_hour === false || total_hour <= 0) {
      throw new BadRequestException('start time or end time not valid');
    }

    const price = Number(total_hour) * Number(court.master_court_types.price);

    const data: UpdateBookingType = {
      uuid: uuid,
      court_id: currentBooking.court_id,
      booking_date: book_date,
      start_time: book_start,
      end_time: book_end,
      total_price: price,
      total_hour: total_hour,
    };

    const cacheKey = `booking:uuid:${uuid}`;
    await this.cacheManager.del(cacheKey);

    return await this.bookingsRepo.updateBooking(data);
  }

  async cancel(uuid: string, dto: CancelBookingDto) {
    const booking = await this.bookingsRepo.findByUUID(uuid);
    if (booking.status !== 'PENDING') {
      throw new BadRequestException(`status booking uuid '${uuid}' not valid `);
    }
    const reason = dto.reason ?? 'canceled by admin';

    const cacheKey = `booking:uuid:${uuid}`;
    await this.cacheManager.del(cacheKey);

    return await this.bookingsRepo.cancel(uuid, reason);
  }

  async confirm(uuid: string) {
    const booking = await this.bookingsRepo.findByUUID(uuid);
    if (booking.status !== 'PENDING' || booking.cancel_reason !== null) {
      throw new BadRequestException(`status booking uuid '${uuid}' not valid `);
    }

    const cacheKey = `booking:uuid:${uuid}`;
    await this.cacheManager.del(cacheKey);

    return await this.bookingsRepo.confirm(uuid);
  }

  async adminDashboard(page: number): Promise<
    Prisma.BookingGetPayload<{
      select: {
        id: true;
        uuid: true;
        booking_date: true;
        start_time: true;
        end_time: true;
        status: true;
        court: { select: { name: true } };
      };
    }>[]
  > {
    const limit = 10;
    const pages = page ?? 1;
    const skip = (pages - 1) * limit;
    return await this.bookingsRepo.adminDashboard(skip, limit);
  }

  async findByUserId(
    user_id: number,
    page: number,
  ): Promise<
    Prisma.BookingGetPayload<{
      select: {
        id: true;
        uuid: true;
        booking_date: true;
        start_time: true;
        end_time: true;
        status: true;
        court: { select: { name: true } };
      };
    }>[]
  > {
    const limit = 10;
    const pages = page ?? 1;
    const skip = (pages - 1) * limit;
    return await this.bookingsRepo.findByUserId(user_id, skip, limit);
  }
}

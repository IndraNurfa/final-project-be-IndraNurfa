/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TokenPayload } from 'src/auth/types/auth';
import { IBookingsService } from './bookings.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';
import { Prisma } from '@prisma/client';
import { CancelBookingDto, UpdateBookingDto } from './dto/update-booking.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  private logger = new Logger(BookingsController.name);

  constructor(
    @Inject('IBookingsService')
    private readonly bookingsService: IBookingsService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateBookingDto,
  ) {
    try {
      const { sub, role } = user;
      return await this.bookingsService.create(dto, sub, role);
    } catch (error) {
      this.logger.error('error create booking', error);
      throw error;
    }
  }

  @SkipAuth()
  @Get('available')
  async findAvailable(
    @Query('date') date: string,
    @Query('court') court: string,
  ) {
    try {
      if (court === undefined) {
        throw new BadRequestException('court is missing');
      }
      if (date === undefined) {
        date = new Date().toString();
      }
      return await this.bookingsService.findAvailable(court, date);
    } catch (error) {
      this.logger.error(`error get booking on data ${date}`, error);
      throw error;
    }
  }

  @Roles('Admin')
  @Get('/admin')
  async adminDashboard(@Query('page') page: number) {
    try {
      return await this.bookingsService.adminDashboard(page);
    } catch (error) {
      this.logger.error(`error get booking data for admin`, error);
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @Roles('User')
  @Get('/user')
  async userDashboard(
    @CurrentUser() user: TokenPayload,
    @Query('page') page: number,
  ) {
    try {
      const { sub } = user;
      return await this.bookingsService.findByUserId(sub, page);
    } catch (error) {
      this.logger.error(`error get booking data for admin`, error);
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string) {
    try {
      return await this.bookingsService.findByUUID(uuid);
    } catch (error) {
      this.logger.error(`error get booking uuid ${uuid}`, error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`booking uuid ${uuid} not found.`);
        }

        this.logger.error('Unhandled Prisma error', error.code, error.meta);
      }
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @Roles('Admin')
  @Patch('cancel/:uuid')
  async cancel(@Param('uuid') uuid: string, @Body() dto: CancelBookingDto) {
    try {
      await this.bookingsService.cancel(uuid, dto);
    } catch (error) {
      this.logger.error('error update booking', error);
      throw error;
    }
  }

  @Roles('Admin')
  @Patch('confirm/:uuid')
  async confirm(@Param('uuid') uuid: string) {
    try {
      await this.bookingsService.confirm(uuid);
    } catch (error) {
      this.logger.error('error update booking', error);
      throw error;
    }
  }

  @Patch(':uuid')
  async updateOne(
    @CurrentUser() user: TokenPayload,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateBookingDto,
  ) {
    try {
      const { sub, role } = user;
      await this.bookingsService.updateBooking(uuid, dto, sub, role);
    } catch (error) {
      this.logger.error('error update booking', error);
      throw error;
    }
  }
}

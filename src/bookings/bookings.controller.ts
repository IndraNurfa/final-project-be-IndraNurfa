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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { SkipAuth } from 'src/auth/decorators/skip-auth.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TokenPayload } from 'src/auth/types/auth';
import { IBookingsService } from './bookings.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  BaseResponseBookingDto,
  ResponseAvailableDto,
  ResponseBookingWithDetailDto,
} from './dto/resp-booking.dto';
import { CancelBookingDto, UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  private logger = new Logger(BookingsController.name);

  constructor(
    @Inject('IBookingsService')
    private readonly bookingsService: IBookingsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create booking',
    description: 'Create a new booking for a court.',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiOkResponse({
    description: 'Booking created successfully.',
    type: BaseResponseBookingDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
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
  @ApiOperation({
    summary: 'Get available slots',
    description: 'Get available booking slots for a court and date.',
  })
  @ApiQuery({
    name: 'date',
    required: true,
    example: '2025-08-21',
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiQuery({
    name: 'court',
    required: true,
    example: 'alpha-court-1',
    description: 'Court slug',
  })
  @ApiOkResponse({
    description: 'Available slots returned successfully.',
    type: ResponseAvailableDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
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
  @ApiOperation({
    summary: 'Admin dashboard',
    description: 'Get paginated bookings for admin.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiOkResponse({
    description: 'Paginated bookings for admin.',
    type: [BaseResponseBookingDto],
  })
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
  @ApiOperation({
    summary: 'User dashboard',
    description: 'Get paginated bookings for the current user.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number',
  })
  @ApiOkResponse({
    description: 'Paginated bookings for user.',
    type: [BaseResponseBookingDto],
  })
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
  @ApiOperation({
    summary: 'Get booking by UUID',
    description: 'Get booking detail by UUID.',
  })
  @ApiOkResponse({
    description: 'Booking detail returned successfully.',
    type: ResponseBookingWithDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
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
  @ApiOperation({
    summary: 'Cancel booking',
    description: 'Cancel a booking by UUID. Only accessible by Admin.',
  })
  @ApiBody({ type: CancelBookingDto })
  @ApiOkResponse({ description: 'Booking canceled successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
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
  @ApiOperation({
    summary: 'Confirm booking',
    description: 'Confirm a booking by UUID. Only accessible by Admin.',
  })
  @ApiOkResponse({ description: 'Booking confirmed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async confirm(@Param('uuid') uuid: string) {
    try {
      await this.bookingsService.confirm(uuid);
    } catch (error) {
      this.logger.error('error update booking', error);
      throw error;
    }
  }

  @Patch(':uuid')
  @ApiOperation({
    summary: 'Update booking',
    description: 'Update a booking by UUID.',
  })
  @ApiBody({ type: UpdateBookingDto })
  @ApiOkResponse({ description: 'Booking updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
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

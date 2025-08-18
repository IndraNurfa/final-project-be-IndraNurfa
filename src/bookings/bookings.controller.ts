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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
  //   return this.bookingsService.update(+id, updateBookingDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bookingsService.remove(+id);
  // }
}

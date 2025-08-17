import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TokenPayload } from 'src/auth/types/auth';
import { IBookingsService } from './bookings.interface';
import { CreateBookingDto } from './dto/create-booking.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bookings')
export class BookingsController {
  private logger = new Logger(BookingsController.name);

  constructor(
    @Inject('IBookingsService')
    private readonly bookingsService: IBookingsService,
  ) {}

  @Post()
  create(@CurrentUser() user: TokenPayload, @Body() dto: CreateBookingDto) {
    try {
      const { sub, role } = user;
      return this.bookingsService.create(dto, sub, role);
    } catch (error) {
      this.logger.error('error create booking', error);
    }
  }

  // @Get()
  // findAll() {
  //   return this.bookingsService.findAll();
  // }

  // @Get('available')
  // findAvailable(@Query('date') date: string, @Query('court') court: string) {
  //   this.logger.verbose(`date: ${date}, court: ${court}`);
  //   return this.bookingsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bookingsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
  //   return this.bookingsService.update(+id, updateBookingDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bookingsService.remove(+id);
  // }
}

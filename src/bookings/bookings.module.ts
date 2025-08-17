import { Module } from '@nestjs/common';
import { CourtsModule } from 'src/courts/courts.module';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';

@Module({
  imports: [CourtsModule],
  controllers: [BookingsController],
  providers: [
    { provide: 'IBookingsService', useClass: BookingsService },
    { provide: 'IBookingsRepository', useClass: BookingsRepository },
  ],
  exports: ['IBookingsService', 'IBookingsRepository'],
})
export class BookingsModule {}

import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
} from '@nestjs/common';
import { ICourtsService } from './courts.interface';
import { UpdateMasterCourtDto } from './dto/update-court.dto';

@Controller('courts')
export class CourtsController {
  private logger = new Logger(CourtsController.name);

  constructor(
    @Inject('ICourtsService') private readonly courtsService: ICourtsService,
  ) {}

  @Get()
  findAll() {
    try {
      return this.courtsService.findAll();
    } catch (error) {
      this.logger.error('get all courts failed', error);
    }
  }

  // @Patch('/master-court-types/:id')
  // updateCourt(@Param('id') id: string, @Body() dto: UpdateMasterCourtTypeDto) {
  //   return this.courtsService.update(+id, dto);
  // }

  @Patch('/master-courts/:id')
  updateMasterCourt(
    @Param('id') id: number,
    @Body() dto: UpdateMasterCourtDto,
  ) {
    return this.courtsService.updateMasterCourt(id, dto);
  }
}

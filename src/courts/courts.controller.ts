import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { TokenPayload } from 'src/auth/types/auth';
import { ICourtsService } from './courts.interface';
import {
  UpdateMasterCourtDto,
  UpdateMasterCourtTypeDto,
} from './dto/update-court.dto';

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

  @Get('/master-court-types')
  findMasterType() {
    try {
      return this.courtsService.findMasterType();
    } catch (error) {
      this.logger.error('get all court types failed', error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch('/master-court-types/:id')
  updateCourt(@Param('id') id: number, @Body() dto: UpdateMasterCourtTypeDto) {
    try {
      return this.courtsService.updateMasterType(id, dto);
    } catch (error) {
      this.logger.error('update courts type failed', error);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch('/master-courts/:id')
  updateMasterCourt(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: number,
    @Body() dto: UpdateMasterCourtDto,
  ) {
    try {
      const { sub } = user;
      return this.courtsService.updateMasterCourt(id, dto);
    } catch (error) {
      this.logger.error('update courts failed', error);
    }
  }
}

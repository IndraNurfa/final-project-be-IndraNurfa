import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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
import { Prisma } from '@prisma/client';

@Controller('courts')
export class CourtsController {
  private logger = new Logger(CourtsController.name);

  constructor(
    @Inject('ICourtsService') private readonly courtsService: ICourtsService,
  ) {}

  @Get()
  async findAll() {
    try {
      return await this.courtsService.findAll();
    } catch (error) {
      this.logger.error('get all courts failed', error);
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @Get('/master-court-types')
  async findMasterType() {
    try {
      return await this.courtsService.findMasterType();
    } catch (error) {
      this.logger.error('get all court types failed', error);
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch('/master-court-types/:id')
  async updateCourt(
    @Param('id') id: number,
    @Body() dto: UpdateMasterCourtTypeDto,
  ) {
    try {
      return await this.courtsService.updateMasterType(id, dto);
    } catch (error) {
      this.logger.error('update courts failed', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Court type id ${id} not found.`);
        }

        this.logger.error('Unhandled Prisma error', error.code, error.meta);
      }
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Patch('/master-courts/:id')
  async updateMasterCourt(
    @Param('id') id: number,
    @Body() dto: UpdateMasterCourtDto,
  ) {
    try {
      return await this.courtsService.updateMasterCourt(id, dto);
    } catch (error) {
      this.logger.error('update courts failed', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Court id ${id} not found.`);
        }

        this.logger.error('Unhandled Prisma error', error.code, error.meta);
      }
      throw new InternalServerErrorException('something wrong on our side');
    }
  }
}

import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ICourtsService } from './courts.interface';
import {
  BaseResponseCourtDto,
  ResponseCourtDto,
  ResponseMasterCourtTypeDto,
} from './dto/resp-court-dto';
import {
  UpdateMasterCourtDto,
  UpdateMasterCourtTypeDto,
} from './dto/update-court.dto';

@ApiTags('courts')
@Controller('courts')
export class CourtsController {
  private logger = new Logger(CourtsController.name);

  constructor(
    @Inject('ICourtsService') private readonly courtsService: ICourtsService,
  ) {}

  @UseInterceptors(CacheInterceptor)
  @CacheKey('courts')
  @CacheTTL(24 * 60 * 60 * 1000)
  @Get()
  @ApiOperation({
    summary: 'Get all courts',
    description: 'Retrieve a list of all courts with their types.',
  })
  @ApiOkResponse({
    description: 'List of courts returned successfully.',
    type: [ResponseCourtDto],
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll() {
    try {
      return await this.courtsService.findAll();
    } catch (error) {
      this.logger.error('get all courts failed', error);
      throw new InternalServerErrorException('something wrong on our side');
    }
  }

  @UseInterceptors(CacheInterceptor)
  @CacheKey('courts:type')
  @CacheTTL(24 * 60 * 60 * 1000)
  @Get('/master-court-types')
  @ApiOperation({
    summary: 'Get all master court types',
    description: 'Retrieve a list of all master court types.',
  })
  @ApiOkResponse({
    description: 'List of master court types returned successfully.',
    type: [ResponseMasterCourtTypeDto],
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update master court type',
    description: 'Update a master court type by ID. Only accessible by Admin.',
  })
  @ApiOkResponse({
    description: 'Master court type updated successfully.',
    type: BaseResponseCourtDto,
  })
  @ApiResponse({ status: 404, description: 'Court type not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update master court',
    description: 'Update a master court by ID. Only accessible by Admin.',
  })
  @ApiOkResponse({
    description: 'Master court updated successfully.',
    type: ResponseMasterCourtTypeDto,
  })
  @ApiResponse({ status: 404, description: 'Court not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
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

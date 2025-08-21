import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Inject,
  Logger,
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
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ResponseRoleDto } from './dto/resp-role.dto';
import { IRoleService } from './role.interface';

@ApiTags('role')
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('role')
export class RoleController {
  private logger = new Logger(RoleController.name);

  constructor(
    @Inject('IRoleService')
    private readonly roleService: IRoleService,
  ) {}

  @CacheKey('role:all')
  @CacheTTL(24 * 60 * 60 * 1000)
  @Roles('Admin')
  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description: 'Retrieve a list of all roles. Only accessible by Admin.',
  })
  @ApiOkResponse({
    description: 'List of roles returned successfully.',
    type: [ResponseRoleDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    try {
      return this.roleService.findAll();
    } catch (error) {
      this.logger.error('get role failed', error);
    }
  }
}

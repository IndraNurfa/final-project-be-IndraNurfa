import { Controller, Get, Inject, Logger, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { IRoleService } from './role.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('role')
export class RoleController {
  private logger = new Logger(RoleController.name);

  constructor(
    @Inject('IRoleService')
    private readonly roleService: IRoleService,
  ) {}

  @Roles('Admin')
  @Get()
  findAll() {
    try {
      return this.roleService.findAll();
    } catch (error) {
      this.logger.error('get role failed', error);
    }
  }
}

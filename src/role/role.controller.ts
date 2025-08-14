import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { IRoleService } from './role.interface';

@Controller('role')
export class RoleController {
  private logger = new Logger(RoleController.name);

  constructor(
    @Inject('IRoleService')
    private readonly roleService: IRoleService,
  ) {}

  @Get()
  findAll() {
    try {
      return this.roleService.findAll();
    } catch (error) {
      this.logger.error('get role failed', error);
    }
  }
}

import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleRepository } from './role.repository';
import { RoleService } from './role.service';

@Module({
  controllers: [RoleController],
  providers: [
    { provide: 'IRoleService', useClass: RoleService },
    { provide: 'IRoleRepository', useClass: RoleRepository },
  ],
  exports: ['IRoleService', 'IRoleRepository'],
})
export class RoleModule {}

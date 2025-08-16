import { Module } from '@nestjs/common';
import { RoleModule } from 'src/role/role.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [RoleModule],
  controllers: [UsersController],
  providers: [
    { provide: 'IUsersService', useClass: UsersService },
    { provide: 'IUsersRepository', useClass: UsersRepository },
  ],
  exports: ['IUsersService', 'IUsersRepository'],
})
export class UsersModule {}

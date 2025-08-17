import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CoreModule } from './core/core.module';
import { CourtsModule } from './courts/courts.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { RoleModule } from './role/role.module';
import { SessionModule } from './session/session.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    PrismaModule,
    CoreModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    AuthModule,
    CommonModule,
    SessionModule,
    UsersModule,
    RoleModule,
    CourtsModule,
    BookingsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: 'IAppService', useClass: AppService }, PrismaService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { SessionService } from './session.service';

@Module({
  providers: [
    { provide: 'ISessionService', useClass: SessionService },
    { provide: 'ISessionRepository', useClass: SessionRepository },
  ],
  exports: ['ISessionService', 'ISessionRepository'],
})
export class SessionModule {}

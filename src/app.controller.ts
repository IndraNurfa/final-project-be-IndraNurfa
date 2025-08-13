import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { IAppService } from './app.interface';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(
    @Inject('IAppService') private readonly appService: IAppService,
  ) {}

  @Get('health')
  getHealth(): Promise<string> | undefined {
    try {
      return this.appService.getHealthCheck();
    } catch (error) {
      this.logger.error('health check failed', error);
    }
  }
}

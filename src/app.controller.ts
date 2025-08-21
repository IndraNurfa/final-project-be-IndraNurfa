import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IAppService } from './app.interface';

@ApiTags('App')
@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(
    @Inject('IAppService') private readonly appService: IAppService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Database OK!', type: String })
  @ApiResponse({ status: 500, description: 'Database Down!' })
  getHealth(): Promise<string> | undefined {
    try {
      return this.appService.getHealthCheck();
    } catch (error) {
      this.logger.error('health check failed', error);
    }
  }
}

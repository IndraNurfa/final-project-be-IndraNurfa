import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { IAppService } from './app.interface';

@Injectable()
export class AppService implements IAppService {
  constructor(private prisma: PrismaService) {}

  async getHealthCheck(): Promise<string> {
    return (await this.prisma.$queryRaw`SELECT 1`)
      ? 'Database OK!'
      : 'Database Down!';
  }
}

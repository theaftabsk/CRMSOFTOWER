import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected (PostgreSQL 18)',
        timestamp: new Date().toISOString(),
        version: 'v1.0.0',
        uptime: process.uptime(),
      };
    } catch (e) {
      return {
        status: 'error',
        database: 'disconnected',
        error: (e as Error).message,
      };
    }
  }
}

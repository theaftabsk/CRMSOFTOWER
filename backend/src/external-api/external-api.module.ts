import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { ExternalApiController } from './external-api.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [PrismaModule, WebhooksModule],
  controllers: [ExternalApiController],
  providers: [ExternalApiService],
  exports: [ExternalApiService],
})
export class ExternalApiModule {}

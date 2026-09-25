import { Module } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { PublicApiController } from './public-api.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [PrismaModule, WebhooksModule],
  controllers: [PublicApiController],
  providers: [PublicApiService],
  exports: [PublicApiService],
})
export class PublicApiModule {}

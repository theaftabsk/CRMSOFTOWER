import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GoogleMeetModule } from './google-meet/google-meet.module';
import { ZoomModule } from './zoom/zoom.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, GoogleMeetModule, ZoomModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService, GoogleMeetModule, ZoomModule],
})
export class IntegrationsModule {}

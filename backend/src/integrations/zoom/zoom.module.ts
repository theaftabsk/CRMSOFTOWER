import { Module } from '@nestjs/common';
import { ZoomService } from './zoom.service';
import { ZoomController } from './zoom.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ZoomController],
  providers: [ZoomService],
  exports: [ZoomService],
})
export class ZoomModule {}

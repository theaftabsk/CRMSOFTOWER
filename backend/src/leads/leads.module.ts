import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { DeduplicationService } from './deduplication.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, DeduplicationService],
  exports: [LeadsService, DeduplicationService],
})
export class LeadsModule {}

import { Module } from '@nestjs/common';
import { InquiriesController } from './inquiries.controller';
import { InquiriesRepository } from './inquiries.repository';
import { InquiriesService } from './inquiries.service';

@Module({
  controllers: [InquiriesController],
  providers: [InquiriesService, InquiriesRepository],
})
export class InquiriesModule {}

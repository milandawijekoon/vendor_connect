import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { InquiryStatus } from '@vendorconnect/shared';

export class UpdateInquiryStatusDto {
  @ApiProperty({ enum: InquiryStatus, example: InquiryStatus.CONTACTED })
  @IsEnum(InquiryStatus)
  status!: InquiryStatus;
}

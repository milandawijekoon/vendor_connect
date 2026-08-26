import type { InquiryStatus } from './enums';

export interface InquiryDto {
  id: string;
  vendorId: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  eventDate: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

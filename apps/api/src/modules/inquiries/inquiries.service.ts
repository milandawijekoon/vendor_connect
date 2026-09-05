import { Injectable, NotFoundException } from '@nestjs/common';
import type { InquiryDto, PaginatedResponse } from '@vendorconnect/shared';
import { VendorStatus } from '@vendorconnect/shared';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import type { CreateInquiryDto } from './dto/create-inquiry.dto';
import type { GetInquiriesDto } from './dto/get-inquiries.dto';
import type { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { InquiriesRepository } from './inquiries.repository';

/** Window within which an identical inquiry (same vendor, email, message) is treated as a duplicate. */
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;

function toDto(i: Awaited<ReturnType<InquiriesRepository['create']>>): InquiryDto {
  return {
    id: i.id,
    vendorId: i.vendorId,
    userId: i.userId,
    name: i.name,
    email: i.email,
    phone: i.phone,
    eventDate: i.eventDate?.toISOString() ?? null,
    message: i.message,
    status: i.status as InquiryDto['status'],
    createdAt: i.createdAt.toISOString(),
  };
}

@Injectable()
export class InquiriesService {
  constructor(
    private readonly repo: InquiriesRepository,
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(slug: string, dto: CreateInquiryDto, userId: string | null): Promise<InquiryDto> {
    const vendor = await this.prisma.vendorProfile.findFirst({
      where: { slug, status: VendorStatus.APPROVED, deletedAt: null },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');

    // Collapse identical replays (same vendor + email + message) inside a short
    // window: return the original row and skip a second notification email.
    const duplicate = await this.repo.findRecentDuplicate(
      vendor.id,
      dto.email,
      dto.message,
      new Date(Date.now() - DUPLICATE_WINDOW_MS),
    );
    if (duplicate) return toDto(duplicate);

    const inquiry = await this.repo.create({
      vendor: { connect: { id: vendor.id } },
      ...(userId ? { user: { connect: { id: userId } } } : {}),
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
      message: dto.message,
    });

    // Fire-and-forget email
    void this.mail.sendInquiryNotification({
      vendorEmail: vendor.user.email,
      vendorName: vendor.businessName,
      inquirerName: dto.name,
      inquirerEmail: dto.email,
      inquirerPhone: dto.phone,
      eventDate: dto.eventDate ?? null,
      message: dto.message,
    });

    return toDto(inquiry);
  }

  async findByVendor(userId: string, dto: GetInquiriesDto): Promise<PaginatedResponse<InquiryDto>> {
    const vendor = await this.prisma.vendorProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const { data, total } = await this.repo.findByVendor(vendor.id, dto.status, (page - 1) * limit, limit);

    return {
      data: data.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(userId: string, inquiryId: string, dto: UpdateInquiryStatusDto): Promise<InquiryDto> {
    const vendor = await this.prisma.vendorProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const inquiry = await this.repo.findOne(inquiryId, vendor.id);
    if (!inquiry) throw new NotFoundException('Inquiry not found');

    const updated = await this.repo.updateStatus(inquiryId, dto.status);
    return toDto(updated);
  }
}

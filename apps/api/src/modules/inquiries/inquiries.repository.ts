import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { InquiryStatus } from '@vendorconnect/shared';

@Injectable()
export class InquiriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.InquiryCreateInput) {
    return this.prisma.inquiry.create({ data });
  }

  /**
   * Most recent inquiry to this vendor from the same email with the same message
   * body since `since`. Used to collapse duplicate/replayed submissions so they
   * don't spam the vendor's inbox or pollute the lead table.
   */
  findRecentDuplicate(vendorId: string, email: string, message: string, since: Date) {
    return this.prisma.inquiry.findFirst({
      where: { vendorId, email, message, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVendor(vendorId: string, status: InquiryStatus | undefined, skip: number, take: number) {
    const where: Prisma.InquiryWhereInput = {
      vendorId,
      ...(status ? { status } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.inquiry.count({ where }),
    ]);
    return { data, total };
  }

  findOne(id: string, vendorId: string) {
    return this.prisma.inquiry.findFirst({ where: { id, vendorId } });
  }

  updateStatus(id: string, status: InquiryStatus) {
    return this.prisma.inquiry.update({ where: { id }, data: { status } });
  }
}

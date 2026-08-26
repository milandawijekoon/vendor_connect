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

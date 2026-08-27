import { Injectable, NotFoundException } from '@nestjs/common';
import type { AdminStatsDto, AdminVendorDto, PaginatedResponse } from '@vendorconnect/shared';
import { VendorStatus } from '@vendorconnect/shared';
import { PrismaService } from '../../database/prisma.service';
import { SearchService } from '../search/search.service';
import type { ListVendorsAdminDto } from './dto/list-vendors-admin.dto';
import type { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';

const ADMIN_VENDOR_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
} as const;

// Status changes re-index the vendor in Meilisearch, so the full set of
// searchable fields — categories included — must be loaded here.
const ADMIN_VENDOR_STATUS_INCLUDE = {
  ...ADMIN_VENDOR_INCLUDE,
  categories: { include: { category: true } },
} as const;

function toPage<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly search: SearchService,
  ) {}

  async listVendors(dto: ListVendorsAdminDto): Promise<PaginatedResponse<AdminVendorDto>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(dto.status ? { status: dto.status } : {}),
    };

    const [vendors, total] = await Promise.all([
      this.prisma.vendorProfile.findMany({
        where,
        include: ADMIN_VENDOR_INCLUDE,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.vendorProfile.count({ where }),
    ]);

    const data: AdminVendorDto[] = vendors.map((v) => ({
      id: v.id,
      slug: v.slug,
      businessName: v.businessName,
      city: v.city,
      status: v.status as VendorStatus,
      avgRating: v.avgRating,
      reviewCount: v.reviewCount,
      createdAt: v.createdAt.toISOString(),
      owner: { id: v.user.id, name: v.user.name, email: v.user.email },
    }));

    return toPage(data, total, page, limit);
  }

  async updateVendorStatus(vendorId: string, dto: UpdateVendorStatusDto): Promise<AdminVendorDto> {
    const existing = await this.prisma.vendorProfile.findFirst({
      where: { id: vendorId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Vendor not found');

    const updated = await this.prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status: dto.status },
      include: ADMIN_VENDOR_STATUS_INCLUDE,
    });

    // Keep Meilisearch in sync — status is a filterable attribute
    void this.search.indexVendor({
      id: updated.id,
      businessName: updated.businessName,
      description: updated.description,
      city: updated.city,
      categoryNames: updated.categories.map((vc) => vc.category.name),
      priceMin: updated.priceMin,
      priceMax: updated.priceMax,
      avgRating: updated.avgRating,
      status: updated.status,
      slug: updated.slug,
    });

    return {
      id: updated.id,
      slug: updated.slug,
      businessName: updated.businessName,
      city: updated.city,
      status: updated.status as VendorStatus,
      avgRating: updated.avgRating,
      reviewCount: updated.reviewCount,
      createdAt: updated.createdAt.toISOString(),
      owner: { id: updated.user.id, name: updated.user.name, email: updated.user.email },
    };
  }

  async getStats(): Promise<AdminStatsDto> {
    const [byStatus, users, inquiries, reviews] = await Promise.all([
      this.prisma.vendorProfile.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.inquiry.count(),
      this.prisma.review.count(),
    ]);

    const statusMap = Object.fromEntries(byStatus.map((r) => [r.status, r._count.id]));
    return {
      vendors: {
        total: Object.values(statusMap).reduce((a, b) => a + b, 0),
        pending: statusMap['PENDING'] ?? 0,
        approved: statusMap['APPROVED'] ?? 0,
        rejected: statusMap['REJECTED'] ?? 0,
        suspended: statusMap['SUSPENDED'] ?? 0,
      },
      users,
      inquiries,
      reviews,
    };
  }
}

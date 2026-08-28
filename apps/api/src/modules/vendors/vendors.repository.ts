import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const VENDOR_INCLUDE = {
  categories: { include: { category: true } },
  images: { orderBy: { order: 'asc' as const } },
  externalReviews: { orderBy: { createdAt: 'desc' as const } },
  user: { select: { name: true, phone: true } },
} satisfies Prisma.VendorProfileInclude;

const VENDOR_LIST_INCLUDE = {
  categories: { include: { category: true } },
  images: { orderBy: { order: 'asc' as const }, take: 1 },
} satisfies Prisma.VendorProfileInclude;

export type VendorListRaw = Prisma.VendorProfileGetPayload<{ include: typeof VENDOR_LIST_INCLUDE }>;

@Injectable()
export class VendorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlug(slug: string) {
    return this.prisma.vendorProfile.findFirst({
      where: { slug, deletedAt: null },
      include: VENDOR_INCLUDE,
    });
  }

  findByUserId(userId: string) {
    return this.prisma.vendorProfile.findFirst({
      where: { userId, deletedAt: null },
      include: VENDOR_INCLUDE,
    });
  }

  findBySlugExists(slug: string) {
    return this.prisma.vendorProfile.findFirst({ where: { slug }, select: { id: true } });
  }

  create(data: Prisma.VendorProfileCreateInput) {
    return this.prisma.vendorProfile.create({ data, include: VENDOR_INCLUDE });
  }

  update(id: string, data: Prisma.VendorProfileUpdateInput) {
    return this.prisma.vendorProfile.update({ where: { id }, data, include: VENDOR_INCLUDE });
  }

  softDelete(id: string) {
    return this.prisma.vendorProfile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ── categories ──────────────────────────────────────────────────────────────

  syncCategories(vendorId: string, categoryIds: string[]) {
    return this.prisma.$transaction([
      this.prisma.vendorCategory.deleteMany({ where: { vendorId } }),
      this.prisma.vendorCategory.createMany({
        data: categoryIds.map((categoryId) => ({ vendorId, categoryId })),
        skipDuplicates: true,
      }),
    ]);
  }

  // ── portfolio images ─────────────────────────────────────────────────────────

  addImage(data: Prisma.PortfolioImageCreateInput) {
    return this.prisma.portfolioImage.create({ data });
  }

  findImage(id: string, vendorId: string) {
    return this.prisma.portfolioImage.findFirst({ where: { id, vendorId } });
  }

  deleteImage(id: string) {
    return this.prisma.portfolioImage.delete({ where: { id } });
  }

  updateImageOrder(id: string, order: number) {
    return this.prisma.portfolioImage.update({ where: { id }, data: { order } });
  }

  countImages(vendorId: string) {
    return this.prisma.portfolioImage.count({ where: { vendorId } });
  }

  // ── listing / search ─────────────────────────────────────────────────────────

  async findMany(where: Prisma.VendorProfileWhereInput, skip: number, take: number) {
    const [vendors, total] = await Promise.all([
      this.prisma.vendorProfile.findMany({
        where,
        include: VENDOR_LIST_INCLUDE,
        orderBy: [{ avgRating: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.vendorProfile.count({ where }),
    ]);
    return { vendors, total };
  }
}

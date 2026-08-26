import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const REVIEW_INCLUDE = {
  user: { select: { name: true } },
} satisfies Prisma.ReviewInclude;

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ReviewCreateInput) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({ data, include: REVIEW_INCLUDE });

      // Recalculate avgRating and reviewCount
      const agg = await tx.review.aggregate({
        where: { vendorId: review.vendorId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.vendorProfile.update({
        where: { id: review.vendorId },
        data: {
          avgRating: agg._avg.rating ?? 0,
          reviewCount: agg._count.rating,
        },
      });

      return review;
    });
  }

  async findByVendor(vendorId: string, skip: number, take: number) {
    const where: Prisma.ReviewWhereInput = { vendorId };
    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: REVIEW_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { data, total };
  }

  findByUserAndVendor(userId: string, vendorId: string) {
    return this.prisma.review.findUnique({ where: { vendorId_userId: { vendorId, userId } } });
  }
}

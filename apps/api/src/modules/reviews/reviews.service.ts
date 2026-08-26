import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PaginatedResponse, ReviewDto } from '@vendorconnect/shared';
import { VendorStatus } from '@vendorconnect/shared';
import { PrismaService } from '../../database/prisma.service';
import type { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsRepository } from './reviews.repository';

type ReviewRaw = Awaited<ReturnType<ReviewsRepository['create']>>;

function toDto(r: ReviewRaw): ReviewDto {
  return {
    id: r.id,
    vendorId: r.vendorId,
    userId: r.userId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    reviewer: { name: r.user.name },
  };
}

@Injectable()
export class ReviewsService {
  constructor(
    private readonly repo: ReviewsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(slug: string, dto: CreateReviewDto, userId: string): Promise<ReviewDto> {
    const vendor = await this.prisma.vendorProfile.findFirst({
      where: { slug, status: VendorStatus.APPROVED, deletedAt: null },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const existing = await this.repo.findByUserAndVendor(userId, vendor.id);
    if (existing) throw new ConflictException('You have already reviewed this vendor');

    const review = await this.repo.create({
      vendor: { connect: { id: vendor.id } },
      user: { connect: { id: userId } },
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    return toDto(review);
  }

  async findByVendor(slug: string, page: number, limit: number): Promise<PaginatedResponse<ReviewDto>> {
    const vendor = await this.prisma.vendorProfile.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const { data, total } = await this.repo.findByVendor(vendor.id, (page - 1) * limit, limit);
    return {
      data: data.map(toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

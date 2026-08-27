import { Injectable } from '@nestjs/common';
import type { CityStatDto, PlatformStatsDto } from '@vendorconnect/shared';
import { PrismaService } from '../../database/prisma.service';

const APPROVED = { status: 'APPROVED', deletedAt: null } as const;

@Injectable()
export class MetaService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<PlatformStatsDto> {
    const [approvedVendors, cityGroups, ratingAgg, reviews, inquiries] = await Promise.all([
      this.prisma.vendorProfile.count({ where: APPROVED }),
      this.prisma.vendorProfile.groupBy({ by: ['city'], where: APPROVED, _count: { _all: true } }),
      this.prisma.vendorProfile.aggregate({
        where: { ...APPROVED, reviewCount: { gt: 0 } },
        _avg: { avgRating: true },
      }),
      this.prisma.review.count(),
      this.prisma.inquiry.count(),
    ]);

    return {
      approvedVendors,
      cities: cityGroups.length,
      avgRating: Math.round((ratingAgg._avg.avgRating ?? 0) * 10) / 10,
      reviews,
      inquiries,
    };
  }

  async getCities(): Promise<CityStatDto[]> {
    const groups = await this.prisma.vendorProfile.groupBy({
      by: ['city'],
      where: APPROVED,
      _count: { _all: true },
    });

    return groups
      .map((g) => ({ city: g.city, vendorCount: g._count._all }))
      .sort((a, b) => b.vendorCount - a.vendorCount || a.city.localeCompare(b.city));
  }
}

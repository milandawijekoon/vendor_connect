import { Injectable } from '@nestjs/common';
import type { CategoryDto } from '@vendorconnect/shared';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryDto[]> {
    const [categories, counts] = await Promise.all([
      this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.vendorCategory.groupBy({
        by: ['categoryId'],
        where: { vendor: { status: 'APPROVED', deletedAt: null } },
        _count: { _all: true },
      }),
    ]);

    const countByCategory = new Map(counts.map((c) => [c.categoryId, c._count._all]));

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      vendorCount: countByCategory.get(c.id) ?? 0,
    }));
  }

  findById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  findManyByIds(ids: string[]) {
    return this.prisma.category.findMany({ where: { id: { in: ids } } });
  }
}

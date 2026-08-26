import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  findManyByIds(ids: string[]) {
    return this.prisma.category.findMany({ where: { id: { in: ids } } });
  }
}

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../database/prisma.service';
import { SearchService } from '../modules/search/search.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const prisma = app.get(PrismaService);
  const search = app.get(SearchService);

  const vendors = await prisma.vendorProfile.findMany({
    where: { deletedAt: null },
    include: { categories: { include: { category: true } } },
  });

  const docs = vendors.map((v) => ({
    id: v.id,
    businessName: v.businessName,
    description: v.description,
    city: v.city,
    categoryNames: v.categories.map((vc) => vc.category.name),
    priceMin: v.priceMin,
    priceMax: v.priceMax,
    avgRating: v.avgRating,
    status: v.status,
    slug: v.slug,
  }));

  await search.reindexAll(docs);
  console.log(`✓ Reindexed ${docs.length} vendors`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

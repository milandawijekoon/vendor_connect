import type { PrismaService } from '../database/prisma.service';

type Jestify<T> = { [K in keyof T]: jest.Mock };

export interface PrismaMock {
  vendorProfile: Jestify<Pick<
    PrismaService['vendorProfile'],
    'findFirst' | 'findMany' | 'count' | 'update' | 'groupBy' | 'aggregate'
  >>;
  user: Jestify<Pick<PrismaService['user'], 'count'>>;
  inquiry: Jestify<Pick<PrismaService['inquiry'], 'count'>>;
  review: Jestify<Pick<PrismaService['review'], 'count'>>;
}

/**
 * Minimal hand-rolled Prisma mock for services that reach into `PrismaService`
 * directly. Cast the result with `asPrisma()` when passing to the Nest DI container.
 */
export function createPrismaMock(): PrismaMock {
  return {
    vendorProfile: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    user: { count: jest.fn() },
    inquiry: { count: jest.fn() },
    review: { count: jest.fn() },
  };
}

export function asPrisma(mock: PrismaMock): PrismaService {
  return mock as unknown as PrismaService;
}

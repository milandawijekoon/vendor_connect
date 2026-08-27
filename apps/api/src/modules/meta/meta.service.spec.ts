import { Test } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { MetaService } from './meta.service';
import { asPrisma, createPrismaMock } from '../../test/prisma.mock';

describe('MetaService', () => {
  let service: MetaService;
  const prisma = createPrismaMock();

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [MetaService, { provide: PrismaService, useValue: asPrisma(prisma) }],
    }).compile();
    service = moduleRef.get(MetaService);
  });

  describe('getStats', () => {
    it('aggregates approved-vendor figures and rounds the average rating to 1 dp', async () => {
      prisma.vendorProfile.count.mockResolvedValue(48);
      prisma.vendorProfile.groupBy.mockResolvedValue([
        { city: 'Colombo', _count: { _all: 18 } },
        { city: 'Kandy', _count: { _all: 9 } },
      ]);
      prisma.vendorProfile.aggregate.mockResolvedValue({ _avg: { avgRating: 4.66 } });
      prisma.review.count.mockResolvedValue(213);
      prisma.inquiry.count.mockResolvedValue(512);

      await expect(service.getStats()).resolves.toEqual({
        approvedVendors: 48,
        cities: 2,
        avgRating: 4.7,
        reviews: 213,
        inquiries: 512,
      });

      const [countArgs] = prisma.vendorProfile.count.mock.calls[0] as [{ where: Record<string, unknown> }];
      expect(countArgs.where).toMatchObject({ status: 'APPROVED', deletedAt: null });
    });

    it('falls back to 0 when no approved vendor has a rating', async () => {
      prisma.vendorProfile.count.mockResolvedValue(0);
      prisma.vendorProfile.groupBy.mockResolvedValue([]);
      prisma.vendorProfile.aggregate.mockResolvedValue({ _avg: { avgRating: null } });
      prisma.review.count.mockResolvedValue(0);
      prisma.inquiry.count.mockResolvedValue(0);

      await expect(service.getStats()).resolves.toEqual({
        approvedVendors: 0,
        cities: 0,
        avgRating: 0,
        reviews: 0,
        inquiries: 0,
      });
    });
  });

  describe('getCities', () => {
    it('maps and orders cities by vendor count then name', async () => {
      prisma.vendorProfile.groupBy.mockResolvedValue([
        { city: 'Kandy', _count: { _all: 9 } },
        { city: 'Galle', _count: { _all: 9 } },
        { city: 'Colombo', _count: { _all: 18 } },
      ]);

      await expect(service.getCities()).resolves.toEqual([
        { city: 'Colombo', vendorCount: 18 },
        { city: 'Galle', vendorCount: 9 },
        { city: 'Kandy', vendorCount: 9 },
      ]);
    });
  });
});

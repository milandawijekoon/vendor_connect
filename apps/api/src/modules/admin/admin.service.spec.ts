import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { VendorStatus } from '@vendorconnect/shared';
import { PrismaService } from '../../database/prisma.service';
import { SearchService } from '../search/search.service';
import { AdminService } from './admin.service';
import { makeVendor } from '../../test/factories';
import { asPrisma, createPrismaMock } from '../../test/prisma.mock';

describe('AdminService', () => {
  let service: AdminService;
  const prisma = createPrismaMock();
  const search = { indexVendor: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: asPrisma(prisma) },
        { provide: SearchService, useValue: search },
      ],
    }).compile();
    service = moduleRef.get(AdminService);
  });

  describe('listVendors', () => {
    it('paginates and maps vendors, filtering by status when given', async () => {
      const vendor = { ...makeVendor(), user: { id: 'user_1', name: 'Nimal', email: 'n@example.com' } };
      prisma.vendorProfile.findMany.mockResolvedValue([vendor]);
      prisma.vendorProfile.count.mockResolvedValue(1);

      const result = await service.listVendors({ status: VendorStatus.PENDING, page: 2, limit: 10 });

      const [findArgs] = prisma.vendorProfile.findMany.mock.calls[0] as [
        { where: Record<string, unknown>; skip: number; take: number },
      ];
      expect(findArgs.where).toMatchObject({ deletedAt: null, status: VendorStatus.PENDING });
      expect(findArgs.skip).toBe(10);
      expect(findArgs.take).toBe(10);
      expect(result).toMatchObject({ total: 1, page: 2, limit: 10, totalPages: 1 });
      expect(result.data[0]).toMatchObject({ id: vendor.id, owner: { email: 'n@example.com' } });
    });
  });

  describe('updateVendorStatus', () => {
    it('throws NotFound for an unknown vendor', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue(null);

      await expect(
        service.updateVendorStatus('vendor_x', { status: VendorStatus.APPROVED }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.vendorProfile.update).not.toHaveBeenCalled();
    });

    it('updates the status and re-indexes the vendor for search', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue(makeVendor({ id: 'vendor_1' }));
      prisma.vendorProfile.update.mockResolvedValue({
        ...makeVendor({ id: 'vendor_1', status: VendorStatus.APPROVED }),
        user: { id: 'user_1', name: 'Nimal', email: 'n@example.com' },
        categories: [{ category: { id: 'c1', name: 'Photography', slug: 'photography' } }],
      });

      const result = await service.updateVendorStatus('vendor_1', { status: VendorStatus.APPROVED });

      const [updateArgs] = prisma.vendorProfile.update.mock.calls[0] as [
        { where: unknown; data: Record<string, unknown> },
      ];
      expect(updateArgs.data).toMatchObject({ status: VendorStatus.APPROVED });
      expect(search.indexVendor).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'vendor_1', categoryNames: ['Photography'] }),
      );
      expect(result.status).toBe(VendorStatus.APPROVED);
    });
  });

  describe('getStats', () => {
    it('aggregates vendor status counts alongside entity totals', async () => {
      prisma.vendorProfile.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: { id: 3 } },
        { status: 'APPROVED', _count: { id: 10 } },
        { status: 'REJECTED', _count: { id: 1 } },
      ]);
      prisma.user.count.mockResolvedValue(42);
      prisma.inquiry.count.mockResolvedValue(88);
      prisma.review.count.mockResolvedValue(17);

      const stats = await service.getStats();

      expect(stats).toEqual({
        vendors: { total: 14, pending: 3, approved: 10, rejected: 1, suspended: 0 },
        users: 42,
        inquiries: 88,
        reviews: 17,
      });
    });
  });
});

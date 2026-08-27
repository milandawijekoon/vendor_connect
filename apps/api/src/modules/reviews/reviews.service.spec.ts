import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';
import { makeReview } from '../../test/factories';
import { asPrisma, createPrismaMock } from '../../test/prisma.mock';

describe('ReviewsService', () => {
  let service: ReviewsService;
  const prisma = createPrismaMock();
  const repo = {
    create: jest.fn(),
    findByVendor: jest.fn(),
    findByUserAndVendor: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: ReviewsRepository, useValue: repo },
        { provide: PrismaService, useValue: asPrisma(prisma) },
      ],
    }).compile();
    service = moduleRef.get(ReviewsService);
  });

  describe('create', () => {
    const dto = { rating: 5, comment: 'Absolutely stunning photos.' };

    it('throws NotFound when the vendor is not an approved vendor', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue(null);

      await expect(service.create('missing', dto, 'user_1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects a second review from the same user', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({ id: 'vendor_1' });
      repo.findByUserAndVendor.mockResolvedValue(makeReview());

      await expect(service.create('ceylon-lens-studio', dto, 'user_1')).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('creates the review and maps it to a DTO', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({ id: 'vendor_1' });
      repo.findByUserAndVendor.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeReview({ vendorId: 'vendor_1', userId: 'user_1', rating: 5 }));

      const result = await service.create('ceylon-lens-studio', dto, 'user_1');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          vendor: { connect: { id: 'vendor_1' } },
          user: { connect: { id: 'user_1' } },
          rating: 5,
        }),
      );
      expect(result).toMatchObject({ rating: 5, reviewer: { name: 'Kamala Silva' } });
    });

    it('stores comment as null when omitted', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({ id: 'vendor_1' });
      repo.findByUserAndVendor.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeReview());

      await service.create('ceylon-lens-studio', { rating: 4 }, 'user_1');

      const [arg] = repo.create.mock.calls[0] as [Record<string, unknown>];
      expect(arg['comment']).toBeNull();
    });
  });

  describe('findByVendor', () => {
    it('throws NotFound for an unknown vendor slug', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue(null);

      await expect(service.findByVendor('missing', 1, 10)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns a paginated envelope of review DTOs', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({ id: 'vendor_1' });
      repo.findByVendor.mockResolvedValue({ data: [makeReview(), makeReview(), makeReview()], total: 7 });

      const result = await service.findByVendor('ceylon-lens-studio', 2, 3);

      expect(repo.findByVendor).toHaveBeenCalledWith('vendor_1', 3, 3);
      expect(result).toMatchObject({ total: 7, page: 2, limit: 3, totalPages: 3 });
      expect(result.data).toHaveLength(3);
    });
  });
});

import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { VendorStatus } from '@vendorconnect/shared';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { SearchService } from '../search/search.service';
import { VendorsRepository } from './vendors.repository';
import { VendorsService } from './vendors.service';
import { makeVendor, makeVendorImage } from '../../test/factories';

describe('VendorsService', () => {
  let service: VendorsService;

  const repo = {
    findByUserId: jest.fn(),
    findBySlug: jest.fn(),
    findBySlugExists: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    syncCategories: jest.fn(),
    countImages: jest.fn(),
    addImage: jest.fn(),
    findImage: jest.fn(),
    deleteImage: jest.fn(),
    updateImageOrder: jest.fn(),
    findMany: jest.fn(),
  };
  const cloudinary = {
    uploadImage: jest.fn(),
    deleteImage: jest.fn(),
  };
  const searchSvc = {
    indexVendor: jest.fn(),
    searchIds: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    searchSvc.indexVendor.mockResolvedValue(undefined);

    const moduleRef = await Test.createTestingModule({
      providers: [
        VendorsService,
        { provide: VendorsRepository, useValue: repo },
        { provide: CloudinaryService, useValue: cloudinary },
        { provide: SearchService, useValue: searchSvc },
      ],
    }).compile();

    service = moduleRef.get(VendorsService);
  });

  describe('create', () => {
    const dto = {
      businessName: 'Ceylon Lens Studio',
      description: 'Award-winning event photography across the island.',
      city: 'Colombo',
    };

    it('rejects when the user already has a profile', async () => {
      repo.findByUserId.mockResolvedValue(makeVendor());

      await expect(service.create('user_1', dto)).rejects.toBeInstanceOf(ConflictException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('creates a profile with a slugified name and indexes it', async () => {
      repo.findByUserId.mockResolvedValue(null);
      repo.findBySlugExists.mockResolvedValue(null);
      const created = makeVendor({ slug: 'ceylon-lens-studio' });
      repo.create.mockResolvedValue(created);

      const result = await service.create('user_1', dto);

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'ceylon-lens-studio' }));
      expect(searchSvc.indexVendor).toHaveBeenCalledWith(expect.objectContaining({ id: created.id }));
      expect(result.slug).toBe('ceylon-lens-studio');
    });

    it('appends a numeric suffix when the slug is taken', async () => {
      repo.findByUserId.mockResolvedValue(null);
      repo.findBySlugExists
        .mockResolvedValueOnce({ id: 'x' })
        .mockResolvedValueOnce({ id: 'y' })
        .mockResolvedValueOnce(null);
      repo.create.mockResolvedValue(makeVendor({ slug: 'ceylon-lens-studio-2' }));

      await service.create('user_1', dto);

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'ceylon-lens-studio-2' }));
    });

    it('syncs categories and re-reads the profile when categoryIds are given', async () => {
      repo.findByUserId.mockResolvedValueOnce(null).mockResolvedValueOnce(makeVendor());
      repo.findBySlugExists.mockResolvedValue(null);
      repo.create.mockResolvedValue(makeVendor());
      repo.syncCategories.mockResolvedValue(undefined);

      await service.create('user_1', { ...dto, categoryIds: ['cat_1', 'cat_2'] });

      expect(repo.syncCategories).toHaveBeenCalledWith(expect.any(String), ['cat_1', 'cat_2']);
      expect(repo.findByUserId).toHaveBeenCalledTimes(2);
    });
  });

  describe('findOwn', () => {
    it('throws NotFound when the user has no profile', async () => {
      repo.findByUserId.mockResolvedValue(null);
      await expect(service.findOwn('user_1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the profile DTO', async () => {
      const vendor = makeVendor();
      repo.findByUserId.mockResolvedValue(vendor);

      const result = await service.findOwn('user_1');

      expect(result).toMatchObject({ id: vendor.id, slug: vendor.slug, businessName: vendor.businessName });
    });
  });

  describe('findPublic', () => {
    it('throws NotFound for an unknown slug', async () => {
      repo.findBySlug.mockResolvedValue(null);
      await expect(service.findPublic('nope')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws NotFound when the vendor is not APPROVED', async () => {
      repo.findBySlug.mockResolvedValue(makeVendor({ status: VendorStatus.PENDING }));
      await expect(service.findPublic('ceylon-lens-studio')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the DTO for an approved vendor', async () => {
      const vendor = makeVendor({ status: VendorStatus.APPROVED });
      repo.findBySlug.mockResolvedValue(vendor);

      await expect(service.findPublic('ceylon-lens-studio')).resolves.toMatchObject({ id: vendor.id });
    });
  });

  describe('update', () => {
    it('throws NotFound when there is no profile', async () => {
      repo.findByUserId.mockResolvedValue(null);
      await expect(service.update('user_1', { city: 'Kandy' })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('passes through only the provided fields', async () => {
      const vendor = makeVendor();
      repo.findByUserId.mockResolvedValue(vendor);
      repo.update.mockResolvedValue(makeVendor({ city: 'Kandy' }));

      await service.update('user_1', { city: 'Kandy' });

      expect(repo.update).toHaveBeenCalledWith(vendor.id, { city: 'Kandy' });
    });

    it('syncs categories when categoryIds are provided', async () => {
      const vendor = makeVendor();
      repo.findByUserId.mockResolvedValue(vendor);
      repo.update.mockResolvedValue(vendor);
      repo.syncCategories.mockResolvedValue(undefined);

      await service.update('user_1', { categoryIds: ['cat_9'] });

      expect(repo.syncCategories).toHaveBeenCalledWith(vendor.id, ['cat_9']);
    });
  });

  describe('uploadImage', () => {
    const file = { buffer: Buffer.from('img') } as Express.Multer.File;

    it('throws NotFound when the user has no profile', async () => {
      repo.findByUserId.mockResolvedValue(null);
      await expect(service.uploadImage('user_1', file)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects once the image limit is reached', async () => {
      repo.findByUserId.mockResolvedValue(makeVendor());
      repo.countImages.mockResolvedValue(20);

      await expect(service.uploadImage('user_1', file)).rejects.toBeInstanceOf(BadRequestException);
      expect(cloudinary.uploadImage).not.toHaveBeenCalled();
    });

    it('uploads to Cloudinary and stores the image at the next order index', async () => {
      repo.findByUserId.mockResolvedValue(makeVendor({ id: 'vendor_7' }));
      repo.countImages.mockResolvedValue(3);
      cloudinary.uploadImage.mockResolvedValue({ publicId: 'cld_1', url: 'https://cdn/x.jpg' });
      repo.addImage.mockResolvedValue(makeVendorImage(3));

      await service.uploadImage('user_1', file);

      expect(cloudinary.uploadImage).toHaveBeenCalledWith(file.buffer);
      expect(repo.addImage).toHaveBeenCalledWith(
        expect.objectContaining({ cloudinaryPublicId: 'cld_1', url: 'https://cdn/x.jpg', order: 3 }),
      );
    });
  });

  describe('deleteImage', () => {
    it('throws NotFound when the image is not owned by the vendor', async () => {
      repo.findByUserId.mockResolvedValue(makeVendor());
      repo.findImage.mockResolvedValue(null);

      await expect(service.deleteImage('user_1', 'img_x')).rejects.toBeInstanceOf(NotFoundException);
      expect(cloudinary.deleteImage).not.toHaveBeenCalled();
    });

    it('removes the image from Cloudinary and the database', async () => {
      repo.findByUserId.mockResolvedValue(makeVendor());
      repo.findImage.mockResolvedValue({ id: 'img_1', cloudinaryPublicId: 'cld_1', vendorId: 'vendor_1' });

      await service.deleteImage('user_1', 'img_1');

      expect(cloudinary.deleteImage).toHaveBeenCalledWith('cld_1');
      expect(repo.deleteImage).toHaveBeenCalledWith('img_1');
    });
  });

  describe('reorderImages', () => {
    it('rejects an image id that does not belong to the vendor', async () => {
      repo.findByUserId.mockResolvedValue(
        makeVendor({ images: [{ ...makeVendorImage(0), id: 'img_a' }] }),
      );

      await expect(
        service.reorderImages('user_1', { items: [{ id: 'img_stranger', order: 0 }] }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.updateImageOrder).not.toHaveBeenCalled();
    });

    it('updates the order of every supplied image', async () => {
      repo.findByUserId.mockResolvedValue(
        makeVendor({
          images: [
            { ...makeVendorImage(0), id: 'img_a' },
            { ...makeVendorImage(1), id: 'img_b' },
          ],
        }),
      );
      repo.updateImageOrder.mockResolvedValue(undefined);

      await service.reorderImages('user_1', {
        items: [
          { id: 'img_a', order: 1 },
          { id: 'img_b', order: 0 },
        ],
      });

      expect(repo.updateImageOrder).toHaveBeenCalledWith('img_a', 1);
      expect(repo.updateImageOrder).toHaveBeenCalledWith('img_b', 0);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      repo.findMany.mockResolvedValue({ vendors: [], total: 0 });
    });

    it('queries approved, non-deleted vendors when no text query is given', async () => {
      await service.search({ page: 1, limit: 12 });

      const [where] = repo.findMany.mock.calls[0] as [{ AND: unknown[] }];
      expect(where.AND).toEqual(
        expect.arrayContaining([{ deletedAt: null }, { status: VendorStatus.APPROVED }]),
      );
    });

    it('adds city and category filters when provided', async () => {
      await service.search({ city: 'Kandy', categorySlug: 'photography', page: 1, limit: 12 });

      const [where] = repo.findMany.mock.calls[0] as [{ AND: unknown[] }];
      expect(where.AND).toEqual(
        expect.arrayContaining([
          { city: 'Kandy' },
          { categories: { some: { category: { slug: 'photography' } } } },
        ]),
      );
    });

    it('short-circuits to an empty page when Meilisearch returns no ids', async () => {
      searchSvc.searchIds.mockResolvedValue([]);

      const result = await service.search({ q: 'nonexistent', page: 1, limit: 12 });

      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 12, totalPages: 0 });
      expect(repo.findMany).not.toHaveBeenCalled();
    });

    it('restricts the query to Meilisearch id hits', async () => {
      searchSvc.searchIds.mockResolvedValue(['v1', 'v2']);

      await service.search({ q: 'lens', page: 1, limit: 12 });

      const [where] = repo.findMany.mock.calls[0] as [{ AND: unknown[] }];
      expect(where.AND).toEqual(expect.arrayContaining([{ id: { in: ['v1', 'v2'] } }]));
    });

    it('falls back to a SQL LIKE query when Meilisearch is unavailable', async () => {
      searchSvc.searchIds.mockResolvedValue(null);

      await service.search({ q: 'band', page: 1, limit: 12 });

      const [where] = repo.findMany.mock.calls[0] as [{ AND: Array<Record<string, unknown>> }];
      const hasOr = where.AND.some((c) => Array.isArray((c as { OR?: unknown[] }).OR));
      expect(hasOr).toBe(true);
    });
  });
});

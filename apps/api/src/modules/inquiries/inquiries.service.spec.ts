import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { InquiryStatus } from '@vendorconnect/shared';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { InquiriesRepository } from './inquiries.repository';
import { InquiriesService } from './inquiries.service';
import { makeInquiry } from '../../test/factories';
import { asPrisma, createPrismaMock } from '../../test/prisma.mock';

describe('InquiriesService', () => {
  let service: InquiriesService;
  const prisma = createPrismaMock();
  const repo = {
    create: jest.fn(),
    findByVendor: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };
  const mail = { sendInquiryNotification: jest.fn() };

  const dto = {
    name: 'Kamala Silva',
    email: 'kamala@example.com',
    phone: '+94712223334',
    eventDate: '2027-03-15',
    message: 'Looking for a photographer for a March 2027 event.',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        InquiriesService,
        { provide: InquiriesRepository, useValue: repo },
        { provide: PrismaService, useValue: asPrisma(prisma) },
        { provide: MailService, useValue: mail },
      ],
    }).compile();
    service = moduleRef.get(InquiriesService);
  });

  describe('create', () => {
    it('throws NotFound when the vendor slug is not an approved vendor', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue(null);

      await expect(service.create('missing', dto, null)).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('stores the inquiry, links the user when signed in, and emails the vendor', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({
        id: 'vendor_1',
        businessName: 'Ceylon Lens Studio',
        user: { email: 'owner@example.com', name: 'Nimal' },
      });
      repo.create.mockResolvedValue(makeInquiry({ vendorId: 'vendor_1', userId: 'user_9' }));

      const result = await service.create('ceylon-lens-studio', dto, 'user_9');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          vendor: { connect: { id: 'vendor_1' } },
          user: { connect: { id: 'user_9' } },
          eventDate: new Date('2027-03-15'),
        }),
      );
      expect(mail.sendInquiryNotification).toHaveBeenCalledWith(
        expect.objectContaining({ vendorEmail: 'owner@example.com', inquirerName: dto.name }),
      );
      expect(result).toMatchObject({ vendorId: 'vendor_1', status: InquiryStatus.NEW });
    });

    it('omits the user connection for anonymous inquiries', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({
        id: 'vendor_1',
        businessName: 'Ceylon Lens Studio',
        user: { email: 'owner@example.com', name: 'Nimal' },
      });
      repo.create.mockResolvedValue(makeInquiry({ vendorId: 'vendor_1' }));

      await service.create('ceylon-lens-studio', { ...dto, eventDate: undefined }, null);

      const [arg] = repo.create.mock.calls[0] as [Record<string, unknown>];
      expect(arg).not.toHaveProperty('user');
      expect(arg['eventDate']).toBeNull();
    });
  });

  describe('findByVendor', () => {
    it('throws NotFound when the requesting user has no vendor profile', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue(null);

      await expect(service.findByVendor('user_1', { page: 1, limit: 20 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns a paginated envelope', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({ id: 'vendor_1' });
      repo.findByVendor.mockResolvedValue({ data: [makeInquiry(), makeInquiry()], total: 2 });

      const result = await service.findByVendor('user_1', { page: 1, limit: 20 });

      expect(repo.findByVendor).toHaveBeenCalledWith('vendor_1', undefined, 0, 20);
      expect(result).toMatchObject({ total: 2, page: 1, limit: 20, totalPages: 1 });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('updateStatus', () => {
    it('throws NotFound when the inquiry does not belong to the vendor', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({ id: 'vendor_1' });
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('user_1', 'inq_1', { status: InquiryStatus.CONTACTED }),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('updates the status and returns the DTO', async () => {
      prisma.vendorProfile.findFirst.mockResolvedValue({ id: 'vendor_1' });
      repo.findOne.mockResolvedValue(makeInquiry({ id: 'inq_1', vendorId: 'vendor_1' }));
      repo.updateStatus.mockResolvedValue(
        makeInquiry({ id: 'inq_1', vendorId: 'vendor_1', status: InquiryStatus.CONTACTED }),
      );

      const result = await service.updateStatus('user_1', 'inq_1', { status: InquiryStatus.CONTACTED });

      expect(repo.updateStatus).toHaveBeenCalledWith('inq_1', InquiryStatus.CONTACTED);
      expect(result.status).toBe(InquiryStatus.CONTACTED);
    });
  });
});

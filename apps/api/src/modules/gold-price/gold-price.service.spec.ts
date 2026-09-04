import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { fetchDailyGoldSnapshot } from '@vendorconnect/gold-price';
import { PrismaService } from '../../database/prisma.service';
import { asPrisma, createPrismaMock } from '../../test/prisma.mock';
import { GoldPriceService } from './gold-price.service';

jest.mock('@vendorconnect/gold-price', () => ({
  fetchDailyGoldSnapshot: jest.fn(),
}));

const fetchMock = fetchDailyGoldSnapshot as jest.MockedFunction<typeof fetchDailyGoldSnapshot>;

const UPSTREAM = {
  date: '2026-09-03',
  source: 'LBMA' as const,
  auction: 'pm' as const,
  usdPerOz: 4467.15,
  usdToLkr: 328.09,
  world: { perOz: 4467.15, perGram24k: 143.62, perGram22k: 131.65, perGram18k: 107.72 },
  sriLanka: {
    perOz: 1465_000,
    perGram24k: 47_120.5,
    perGram22k: 43_193.8,
    perGram18k: 35_340.4,
    perSovereign22k: 345_550.1,
  },
  fetchedAt: '2026-09-03T16:20:00.000Z',
};

describe('GoldPriceService', () => {
  let service: GoldPriceService;
  const prisma = createPrismaMock();

  const config = {
    get: jest.fn((key: string) => {
      const values: Record<string, unknown> = {
        nodeEnv: 'test',
        'goldPrice.retailPremiumPct': 0.05,
      };
      return values[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        GoldPriceService,
        { provide: PrismaService, useValue: asPrisma(prisma) },
        { provide: ConfigService, useValue: config },
        { provide: SchedulerRegistry, useValue: { addCronJob: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(GoldPriceService);
  });

  describe('refresh', () => {
    it('maps the upstream snapshot and upserts it keyed by auction date', async () => {
      fetchMock.mockResolvedValue(UPSTREAM);
      prisma.goldPriceSnapshot.upsert.mockImplementation(({ create }: { create: unknown }) =>
        Promise.resolve({ id: 'snap1', ...(create as object) }),
      );

      await service.refresh();

      expect(fetchMock).toHaveBeenCalledWith({ retailPremiumPct: 0.05 });
      const [args] = prisma.goldPriceSnapshot.upsert.mock.calls[0] as [
        { where: unknown; create: Record<string, unknown>; update: Record<string, unknown> },
      ];
      expect(args.where).toEqual({ auctionDate: '2026-09-03' });
      expect(args.create).toMatchObject({
        auctionDate: '2026-09-03',
        auction: 'pm',
        source: 'LBMA',
        usdPerOz: 4467.15,
        usdToLkr: 328.09,
        retailPremiumPct: 0.05,
        lkrPerSovereign22k: 345_550.1,
      });
      expect(args.create['fetchedAt']).toBeInstanceOf(Date);
      expect(args.update).not.toHaveProperty('auctionDate');
    });

    it('shares a single in-flight request between concurrent callers', async () => {
      fetchMock.mockResolvedValue(UPSTREAM);
      prisma.goldPriceSnapshot.upsert.mockResolvedValue({ id: 'snap1' });

      await Promise.all([service.refresh(), service.refresh(), service.refresh()]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHistory', () => {
    it('clamps the day count to 1–365 and orders newest first', async () => {
      prisma.goldPriceSnapshot.findMany.mockResolvedValue([]);

      await service.getHistory(9999);
      await service.getHistory(0);
      await service.getHistory(Number.NaN);

      const takes = prisma.goldPriceSnapshot.findMany.mock.calls.map(
        ([a]) => (a as { take: number }).take,
      );
      expect(takes).toEqual([365, 1, 30]);
      const [firstArgs] = prisma.goldPriceSnapshot.findMany.mock.calls[0] as [
        { orderBy: unknown },
      ];
      expect(firstArgs.orderBy).toEqual({ auctionDate: 'desc' });
    });
  });

  describe('refreshIfStale', () => {
    it('returns the stored snapshot when it is already dated today or later', async () => {
      const fresh = { id: 'snap1', auctionDate: '2999-01-01' };
      prisma.goldPriceSnapshot.findFirst.mockResolvedValue(fresh);

      await expect(service.refreshIfStale()).resolves.toBe(fresh);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('fetches when the latest snapshot is stale', async () => {
      prisma.goldPriceSnapshot.findFirst.mockResolvedValue({
        id: 'old',
        auctionDate: '2000-01-01',
      });
      fetchMock.mockResolvedValue(UPSTREAM);
      prisma.goldPriceSnapshot.upsert.mockResolvedValue({ id: 'snap1' });

      await service.refreshIfStale();

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});

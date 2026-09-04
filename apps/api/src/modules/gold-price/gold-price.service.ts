import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { fetchDailyGoldSnapshot, type DailyGoldSnapshot } from '@vendorconnect/gold-price';
import type { GoldPriceSnapshot, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

const CRON_JOB_NAME = 'gold-price:daily-fetch';
const DEFAULT_CRON = '15 16 * * 1-5';
const DEFAULT_TZ = 'Europe/London';

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** `YYYY-MM-DD` in UTC for today. LBMA auction dates are London dates; close enough for a staleness check. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class GoldPriceService implements OnModuleInit {
  private readonly logger = new Logger(GoldPriceService.name);
  private inFlight: Promise<GoldPriceSnapshot> | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    // Jest specs compile the module without a scheduler running.
    if (this.config.get<string>('nodeEnv') === 'test') return;

    const cron = this.config.get<string>('goldPrice.cron') ?? DEFAULT_CRON;
    const timeZone = this.config.get<string>('goldPrice.timezone') ?? DEFAULT_TZ;

    const job = CronJob.from({
      cronTime: cron,
      timeZone,
      onTick: () => {
        void this.refresh().catch((err: unknown) => {
          this.logger.error(`Scheduled gold-price fetch failed: ${errMsg(err)}`);
        });
      },
    });

    this.scheduler.addCronJob(CRON_JOB_NAME, job);
    job.start();
    this.logger.log(`Daily gold-price fetch scheduled (cron="${cron}", tz="${timeZone}")`);

    if ((this.config.get<boolean>('goldPrice.refreshOnBoot') ?? true) === true) {
      void this.refreshIfStale().catch((err: unknown) => {
        this.logger.warn(`Boot gold-price refresh failed: ${errMsg(err)}`);
      });
    }
  }

  /** Latest stored snapshot, or `null` when the table is empty. */
  getLatest(): Promise<GoldPriceSnapshot | null> {
    return this.prisma.goldPriceSnapshot.findFirst({ orderBy: { auctionDate: 'desc' } });
  }

  /** Most recent snapshots, newest first. `days` is clamped to 1–365. */
  getHistory(days = 30): Promise<GoldPriceSnapshot[]> {
    const n = Math.trunc(days);
    const take = Number.isNaN(n) ? 30 : Math.min(Math.max(n, 1), 365);
    return this.prisma.goldPriceSnapshot.findMany({
      orderBy: { auctionDate: 'desc' },
      take,
    });
  }

  /** Fetch only if there is no snapshot dated today or later. */
  async refreshIfStale(): Promise<GoldPriceSnapshot> {
    const latest = await this.getLatest();
    if (latest && latest.auctionDate >= todayIso()) return latest;
    return this.refresh();
  }

  /**
   * Fetch the upstream daily snapshot and upsert it keyed by auction date.
   * Concurrent callers share a single in-flight request.
   */
  refresh(): Promise<GoldPriceSnapshot> {
    if (!this.inFlight) {
      this.inFlight = this.doRefresh().finally(() => {
        this.inFlight = null;
      });
    }
    return this.inFlight;
  }

  private async doRefresh(): Promise<GoldPriceSnapshot> {
    const retailPremiumPct = this.config.get<number>('goldPrice.retailPremiumPct') ?? 0;
    const snap: DailyGoldSnapshot = await fetchDailyGoldSnapshot({ retailPremiumPct });

    const data: Omit<Prisma.GoldPriceSnapshotCreateInput, 'auctionDate'> = {
      auction: snap.auction,
      source: snap.source,
      usdPerOz: snap.usdPerOz,
      usdToLkr: snap.usdToLkr,
      retailPremiumPct,
      worldPerGram24k: snap.world.perGram24k,
      worldPerGram22k: snap.world.perGram22k,
      worldPerGram18k: snap.world.perGram18k,
      lkrPerGram24k: snap.sriLanka.perGram24k,
      lkrPerGram22k: snap.sriLanka.perGram22k,
      lkrPerGram18k: snap.sriLanka.perGram18k,
      lkrPerSovereign22k: snap.sriLanka.perSovereign22k,
      fetchedAt: new Date(snap.fetchedAt),
    };

    const saved = await this.prisma.goldPriceSnapshot.upsert({
      where: { auctionDate: snap.date },
      create: { auctionDate: snap.date, ...data },
      update: data,
    });

    this.logger.log(
      `Gold price ${snap.date}: USD ${snap.usdPerOz.toFixed(2)}/oz · ` +
        `LKR ${Math.round(saved.lkrPerSovereign22k).toLocaleString('en-LK')}/sovereign (22K, 8g)`,
    );
    return saved;
  }
}

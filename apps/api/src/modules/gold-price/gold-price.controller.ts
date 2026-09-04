import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { GoldPriceService } from './gold-price.service';

const SNAPSHOT_EXAMPLE = {
  id: 'clz0goldsnap000001',
  auctionDate: '2026-09-03',
  auction: 'pm',
  source: 'LBMA',
  usdPerOz: 4467.15,
  usdToLkr: 328.09,
  retailPremiumPct: 0,
  worldPerGram24k: 143.62,
  worldPerGram22k: 131.65,
  worldPerGram18k: 107.72,
  lkrPerGram24k: 47120.5,
  lkrPerGram22k: 43193.8,
  lkrPerGram18k: 35340.4,
  lkrPerSovereign22k: 345550.1,
  fetchedAt: '2026-09-03T16:20:00.000Z',
  createdAt: '2026-09-03T16:20:01.000Z',
  updatedAt: '2026-09-03T16:20:01.000Z',
};

@ApiTags('gold-price')
@Controller('gold-price')
export class GoldPriceController {
  constructor(private readonly goldPrice: GoldPriceService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Latest daily gold price',
    description:
      'Most recent stored LBMA snapshot with world (USD) and Sri Lanka (LKR) per-gram / per-sovereign rates. ' +
      'Served from the local store, refreshed by a daily job — this endpoint never calls upstream. ' +
      'Returns `null` before the first fetch has run.',
  })
  @ApiOkResponse({ schema: { example: SNAPSHOT_EXAMPLE } })
  getLatest() {
    return this.goldPrice.getLatest();
  }

  @Public()
  @Get('history')
  @ApiOperation({
    summary: 'Recent gold price history',
    description: 'Stored daily snapshots, newest first.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 365, default: 30 },
    description: 'How many days back to return (clamped to 1–365).',
  })
  @ApiOkResponse({ schema: { example: [SNAPSHOT_EXAMPLE] } })
  getHistory(@Query('days') days?: string) {
    return this.goldPrice.getHistory(days === undefined ? undefined : Number(days));
  }
}

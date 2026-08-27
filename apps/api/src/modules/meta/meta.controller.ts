import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { MetaService } from './meta.service';

const STATS_EXAMPLE = {
  approvedVendors: 48,
  cities: 10,
  avgRating: 4.7,
  reviews: 213,
  inquiries: 512,
};

const CITY_EXAMPLE = [
  { city: 'Colombo', vendorCount: 18 },
  { city: 'Kandy', vendorCount: 9 },
];

@ApiTags('meta')
@Controller('meta')
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Public()
  @Get('stats')
  @ApiOperation({
    summary: 'Platform statistics',
    description: 'Aggregate marketplace figures for the public marketing surface. Derived from approved vendors only.',
  })
  @ApiOkResponse({ schema: { example: STATS_EXAMPLE } })
  getStats() {
    return this.metaService.getStats();
  }

  @Public()
  @Get('cities')
  @ApiOperation({
    summary: 'Cities with approved vendors',
    description: 'Distinct cities that have at least one approved vendor, with counts, ordered by count descending.',
  })
  @ApiOkResponse({ schema: { example: CITY_EXAMPLE } })
  getCities() {
    return this.metaService.getCities();
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check', description: 'Returns `{ status: "ok" }` when the API is running.' })
  @ApiOkResponse({ schema: { example: { status: 'ok', timestamp: '2026-08-24T00:00:00.000Z' } } })
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

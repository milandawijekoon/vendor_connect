import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { InquiryDto } from '@vendorconnect/shared';
import { Role } from '@vendorconnect/shared';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { GetInquiriesDto } from './dto/get-inquiries.dto';
import { UpdateInquiryStatusDto } from './dto/update-inquiry-status.dto';
import { InquiriesService } from './inquiries.service';

const INQUIRY_EXAMPLE: InquiryDto = {
  id: 'clinq001',
  vendorId: 'clvendor001',
  userId: null,
  name: 'Nimal Perera',
  email: 'nimal@example.com',
  phone: '+94771234567',
  eventDate: '2027-03-15T00:00:00.000Z',
  message: 'Hi, I am looking for a photographer for our wedding in March 2027.',
  status: 'NEW' as InquiryDto['status'],
  createdAt: '2026-08-24T00:00:00.000Z',
};

@ApiTags('inquiries')
@Controller('vendors')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Public()
  @Post(':slug/inquiries')
  @ApiOperation({
    summary: 'Submit inquiry',
    description:
      'Send an inquiry to an approved vendor. No authentication required — guests can submit. If the caller is authenticated, the inquiry is linked to their account.',
  })
  @ApiParam({ name: 'slug', description: 'Vendor slug' })
  @ApiCreatedResponse({ description: 'Inquiry submitted.', schema: { example: INQUIRY_EXAMPLE } })
  @ApiNotFoundResponse({ schema: { example: { statusCode: 404, message: 'Vendor not found' } } })
  create(
    @Param('slug') slug: string,
    @Body() dto: CreateInquiryDto,
    @CurrentUser() user: AuthUser | undefined,
  ): Promise<InquiryDto> {
    return this.inquiriesService.create(slug, dto, user?.id ?? null);
  }

  @Roles(Role.VENDOR)
  @Get('me/inquiries')
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'List my inquiries (vendor inbox)',
    description: 'Returns paginated inquiries received by the authenticated vendor, newest first. Filter by `status` to see only leads in a given stage.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        data: [INQUIRY_EXAMPLE],
        total: 1, page: 1, limit: 20, totalPages: 1,
      },
    },
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findAll(@CurrentUser() user: AuthUser, @Query() dto: GetInquiriesDto) {
    return this.inquiriesService.findByVendor(user.id, dto);
  }

  @Roles(Role.VENDOR)
  @Patch('me/inquiries/:id')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update inquiry status', description: 'Advance a lead through NEW → CONTACTED → CONFIRMED → CLOSED.' })
  @ApiParam({ name: 'id', description: 'Inquiry ID' })
  @ApiBody({ type: UpdateInquiryStatusDto })
  @ApiOkResponse({ description: 'Status updated.', schema: { example: { ...INQUIRY_EXAMPLE, status: 'CONTACTED' } } })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInquiryStatusDto,
  ) {
    return this.inquiriesService.updateStatus(user.id, id, dto);
  }
}

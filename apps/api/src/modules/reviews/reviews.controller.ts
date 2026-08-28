import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { ReviewDto } from '@vendorconnect/shared';
import { Role } from '@vendorconnect/shared';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

/** Hard cap on reviews returned per page (applies to both default and client-supplied `limit`). */
const REVIEWS_PAGE_SIZE = 5;

const REVIEW_EXAMPLE: ReviewDto = {
  id: 'clrev001',
  vendorId: 'clvendor001',
  userId: 'cluser001',
  rating: 5,
  comment: 'Absolutely stunning photos. Highly recommend!',
  createdAt: '2026-08-24T00:00:00.000Z',
  reviewer: { name: 'Amara Silva' },
};

@ApiTags('reviews')
@Controller('vendors')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(Role.CUSTOMER)
  @Post(':slug/reviews')
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Submit review',
    description: 'CUSTOMER accounts can leave one review per approved vendor. Rating updates the vendor\'s `avgRating` and `reviewCount` immediately.',
  })
  @ApiParam({ name: 'slug' })
  @ApiCreatedResponse({ schema: { example: REVIEW_EXAMPLE } })
  @ApiConflictResponse({ schema: { example: { statusCode: 409, message: 'You have already reviewed this vendor' } } })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  create(
    @Param('slug') slug: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthUser,
  ): Promise<ReviewDto> {
    return this.reviewsService.create(slug, dto, user.id);
  }

  @Public()
  @Get(':slug/reviews')
  @ApiOperation({
    summary: 'List reviews for a vendor',
    description: 'Public; paginated newest first. Page size is fixed at a maximum of 5 reviews per page.',
  })
  @ApiParam({ name: 'slug' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5, description: 'Clamped to 1–5.' })
  @ApiOkResponse({ schema: { example: { data: [REVIEW_EXAMPLE], total: 1, page: 1, limit: 5, totalPages: 1 } } })
  @ApiNotFoundResponse()
  findAll(
    @Param('slug') slug: string,
    @Query('page') page = 1,
    @Query('limit') limit = REVIEWS_PAGE_SIZE,
  ) {
    const safePage = Math.max(1, Math.floor(Number(page)) || 1);
    const safeLimit = Math.min(REVIEWS_PAGE_SIZE, Math.max(1, Math.floor(Number(limit)) || REVIEWS_PAGE_SIZE));
    return this.reviewsService.findByVendor(slug, safePage, safeLimit);
  }
}

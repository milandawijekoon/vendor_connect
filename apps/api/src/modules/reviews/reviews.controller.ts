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
  @ApiOperation({ summary: 'List reviews for a vendor', description: 'Public; paginated (default 10 per page), newest first.' })
  @ApiParam({ name: 'slug' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ schema: { example: { data: [REVIEW_EXAMPLE], total: 1, page: 1, limit: 10, totalPages: 1 } } })
  @ApiNotFoundResponse()
  findAll(
    @Param('slug') slug: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.findByVendor(slug, Number(page), Number(limit));
  }
}

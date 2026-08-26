import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import type { VendorProfileDto } from '@vendorconnect/shared';
import { Role } from '@vendorconnect/shared';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateVendorProfileDto } from './dto/create-vendor-profile.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { SearchVendorsDto } from './dto/search-vendors.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { VendorsService } from './vendors.service';

// ── shared example payloads ───────────────────────────────────────────────────

const VENDOR_EXAMPLE: VendorProfileDto = {
  id: 'clvendor001',
  slug: 'alice-photography',
  businessName: 'Alice Photography',
  description: 'Professional wedding photography with 10 years of experience across Sri Lanka.',
  city: 'Colombo',
  address: '42 Galle Road, Colombo 3',
  priceMin: 50000,
  priceMax: 200000,
  status: 'PENDING' as VendorProfileDto['status'],
  avgRating: 0,
  reviewCount: 0,
  categories: [{ id: 'clcat001', name: 'Photography', slug: 'photography' }],
  images: [],
  owner: { name: 'Alice Perera', phone: '+94771234567' },
  createdAt: '2026-08-24T00:00:00.000Z',
  updatedAt: '2026-08-24T00:00:00.000Z',
};

const IMAGE_EXAMPLE = {
  id: 'climg001',
  vendorId: 'clvendor001',
  cloudinaryPublicId: 'wedding/portfolio/abc123',
  url: 'https://res.cloudinary.com/demo/image/upload/wedding/portfolio/abc123.jpg',
  order: 0,
  createdAt: '2026-08-24T00:00:00.000Z',
};

const ERROR_401 = { schema: { example: { statusCode: 401, message: 'Unauthorized', error: 'Unauthorized' } } };
const ERROR_403 = { schema: { example: { statusCode: 403, message: 'Insufficient permissions', error: 'Forbidden' } } };
const ERROR_404 = { schema: { example: { statusCode: 404, message: 'Vendor not found', error: 'Not Found' } } };

// ─────────────────────────────────────────────────────────────────────────────

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  // ── discovery ─────────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Search & list vendors',
    description:
      'Returns approved vendors matching the given filters. When Meilisearch is running, `q` performs full-text search; otherwise falls back to MySQL `LIKE` on business name and city. Results are paginated (default 12 per page) and sorted by rating descending.',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Full-text search query' })
  @ApiQuery({ name: 'categorySlug', required: false, description: 'Category slug, e.g. `photography`' })
  @ApiQuery({ name: 'city', required: false, description: 'City name, e.g. `Colombo`' })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 12 })
  @ApiOkResponse({
    schema: {
      example: {
        data: [{ ...VENDOR_EXAMPLE, status: 'APPROVED' }],
        total: 1,
        page: 1,
        limit: 12,
        totalPages: 1,
      },
    },
  })
  searchVendors(@Query() dto: SearchVendorsDto) {
    return this.vendorsService.search(dto);
  }

  // ── own profile (VENDOR only) ─────────────────────────────────────────────

  @Post()
  @Roles(Role.VENDOR)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Create vendor profile',
    description: 'One-time creation of the vendor profile linked to the authenticated user. Initial status is `PENDING` until an admin approves it.',
  })
  @ApiCreatedResponse({ description: 'Profile created successfully.', schema: { example: VENDOR_EXAMPLE } })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ ...ERROR_401 })
  @ApiForbiddenResponse({ ...ERROR_403, description: 'Caller does not have the VENDOR role' })
  @ApiConflictResponse({ schema: { example: { statusCode: 409, message: 'Vendor profile already exists' } }, description: 'Profile already exists for this user' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateVendorProfileDto): Promise<VendorProfileDto> {
    return this.vendorsService.create(user.id, dto);
  }

  @Get('me')
  @Roles(Role.VENDOR)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: "Get own vendor profile",
    description: "Returns the authenticated vendor's full profile regardless of approval status. Use this for the vendor dashboard.",
  })
  @ApiOkResponse({ description: 'Vendor profile.', schema: { example: VENDOR_EXAMPLE } })
  @ApiUnauthorizedResponse({ ...ERROR_401 })
  @ApiForbiddenResponse({ ...ERROR_403 })
  @ApiNotFoundResponse({ ...ERROR_404, description: 'No profile created yet for this user' })
  findOwn(@CurrentUser() user: AuthUser): Promise<VendorProfileDto> {
    return this.vendorsService.findOwn(user.id);
  }

  @Patch('me')
  @Roles(Role.VENDOR)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Update own vendor profile',
    description: 'All fields are optional — send only what changed. `categoryIds` replaces the full set when present.',
  })
  @ApiOkResponse({ description: 'Updated profile.', schema: { example: VENDOR_EXAMPLE } })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @ApiUnauthorizedResponse({ ...ERROR_401 })
  @ApiForbiddenResponse({ ...ERROR_403 })
  @ApiNotFoundResponse({ ...ERROR_404 })
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateVendorProfileDto): Promise<VendorProfileDto> {
    return this.vendorsService.update(user.id, dto);
  }

  // ── portfolio images ──────────────────────────────────────────────────────

  @Post('me/images')
  @Roles(Role.VENDOR)
  @ApiBearerAuth('jwt')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload portfolio image',
    description: 'Uploads an image to Cloudinary and attaches it to the vendor portfolio. Max 5 MB per file; max 20 images total. Accepted types: JPEG, PNG, WebP.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (JPEG / PNG / WebP, ≤ 5 MB)' },
      },
    },
  })
  @ApiCreatedResponse({ description: 'Image uploaded.', schema: { example: IMAGE_EXAMPLE } })
  @ApiBadRequestResponse({ description: 'Invalid file type, file too large, or portfolio is full (20 images)' })
  @ApiUnauthorizedResponse({ ...ERROR_401 })
  @ApiForbiddenResponse({ ...ERROR_403 })
  @ApiNotFoundResponse({ ...ERROR_404 })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
        }
      },
    }),
  )
  uploadImage(@CurrentUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
    return this.vendorsService.uploadImage(user.id, file);
  }

  @Delete('me/images/:imageId')
  @Roles(Role.VENDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Delete portfolio image', description: 'Removes the image from Cloudinary and the database. Only the owning vendor can delete their own images.' })
  @ApiParam({ name: 'imageId', description: 'ID of the portfolio image to delete' })
  @ApiNoContentResponse({ description: 'Image deleted.' })
  @ApiUnauthorizedResponse({ ...ERROR_401 })
  @ApiForbiddenResponse({ ...ERROR_403 })
  @ApiNotFoundResponse({ ...ERROR_404, description: 'Image not found or does not belong to this vendor' })
  deleteImage(@CurrentUser() user: AuthUser, @Param('imageId') imageId: string) {
    return this.vendorsService.deleteImage(user.id, imageId);
  }

  @Patch('me/images/reorder')
  @Roles(Role.VENDOR)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Reorder portfolio images',
    description: 'Sets the `order` value for each image in the supplied array. Send the full desired order — any images omitted retain their current `order`.',
  })
  @ApiBody({ type: ReorderImagesDto, examples: { example: { value: { items: [{ id: 'climg001', order: 0 }, { id: 'climg002', order: 1 }] } } } })
  @ApiOkResponse({ description: 'Order updated.' })
  @ApiBadRequestResponse({ description: 'Validation error or image IDs do not belong to this vendor' })
  @ApiUnauthorizedResponse({ ...ERROR_401 })
  @ApiForbiddenResponse({ ...ERROR_403 })
  reorderImages(@CurrentUser() user: AuthUser, @Body() dto: ReorderImagesDto) {
    return this.vendorsService.reorderImages(user.id, dto);
  }

  // ── public ────────────────────────────────────────────────────────────────

  @Public()
  @Get(':slug')
  @ApiOperation({
    summary: 'Get public vendor profile',
    description: 'Returns a vendor profile visible to anyone. Only `APPROVED` vendors are returned; all other statuses yield 404.',
  })
  @ApiParam({ name: 'slug', description: 'Unique vendor slug, e.g. `alice-photography`', example: 'alice-photography' })
  @ApiOkResponse({ description: 'Vendor profile.', schema: { example: { ...VENDOR_EXAMPLE, status: 'APPROVED' } } })
  @ApiNotFoundResponse({ ...ERROR_404, description: 'Vendor not found or not yet approved' })
  findPublic(@Param('slug') slug: string): Promise<VendorProfileDto> {
    return this.vendorsService.findPublic(slug);
  }
}

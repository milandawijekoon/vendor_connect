import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { PaginatedResponse, VendorListItemDto, VendorProfileDto } from '@vendorconnect/shared';
import { VendorStatus } from '@vendorconnect/shared';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { SearchService } from '../search/search.service';
import type { CreateVendorProfileDto } from './dto/create-vendor-profile.dto';
import type { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import type { ReorderImagesDto } from './dto/reorder-images.dto';
import type { SearchVendorsDto } from './dto/search-vendors.dto';
import { VendorsRepository, type VendorListRaw } from './vendors.repository';

const MAX_IMAGES = 20;

function toPage<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

function toListItemDto(vendor: VendorListRaw): VendorListItemDto {
  return {
    id: vendor.id,
    slug: vendor.slug,
    businessName: vendor.businessName,
    city: vendor.city,
    priceMin: vendor.priceMin,
    priceMax: vendor.priceMax,
    avgRating: vendor.avgRating,
    reviewCount: vendor.reviewCount,
    categories: vendor.categories.map((vc) => ({
      id: vc.category.id,
      name: vc.category.name,
      slug: vc.category.slug,
    })),
    images: vendor.images.map((img) => ({
      id: img.id,
      url: img.url,
      cloudinaryPublicId: img.cloudinaryPublicId,
      order: img.order,
    })),
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toDto(vendor: NonNullable<Awaited<ReturnType<VendorsRepository['findBySlug']>>>): VendorProfileDto {
  return {
    id: vendor.id,
    slug: vendor.slug,
    businessName: vendor.businessName,
    description: vendor.description,
    city: vendor.city,
    address: vendor.address,
    priceMin: vendor.priceMin,
    priceMax: vendor.priceMax,
    status: vendor.status as VendorStatus,
    avgRating: vendor.avgRating,
    reviewCount: vendor.reviewCount,
    facebookUrl: vendor.facebookUrl,
    googleUrl: vendor.googleUrl,
    googleRating: vendor.googleRating,
    googleReviewCount: vendor.googleReviewCount,
    categories: vendor.categories.map((vc) => ({
      id: vc.category.id,
      name: vc.category.name,
      slug: vc.category.slug,
    })),
    images: vendor.images.map((img) => ({
      id: img.id,
      url: img.url,
      cloudinaryPublicId: img.cloudinaryPublicId,
      order: img.order,
    })),
    googleReviews: vendor.externalReviews.map((r) => ({
      id: r.id,
      source: r.source,
      authorName: r.authorName,
      authorPhotoUrl: r.authorPhotoUrl,
      rating: r.rating,
      text: r.text,
      relativeTime: r.relativeTime,
    })),
    owner: { name: vendor.user.name, phone: vendor.user.phone },
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
  };
}

@Injectable()
export class VendorsService {
  constructor(
    private readonly repo: VendorsRepository,
    private readonly cloudinary: CloudinaryService,
    private readonly searchSvc: SearchService,
  ) {}

  // ── profile CRUD ────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateVendorProfileDto): Promise<VendorProfileDto> {
    const existing = await this.repo.findByUserId(userId);
    if (existing) throw new ConflictException('Vendor profile already exists');

    const baseSlug = slugify(dto.businessName);
    const slug = await this.resolveUniqueSlug(baseSlug);

    const vendor = await this.repo.create({
      businessName: dto.businessName,
      slug,
      description: dto.description,
      city: dto.city,
      address: dto.address ?? null,
      priceMin: dto.priceMin ?? null,
      priceMax: dto.priceMax ?? null,
      facebookUrl: dto.facebookUrl ?? null,
      googleUrl: dto.googleUrl ?? null,
      user: { connect: { id: userId } },
    });

    if (dto.categoryIds?.length) {
      await this.repo.syncCategories(vendor.id, dto.categoryIds);
      const refreshed = await this.repo.findByUserId(userId);
      const result = toDto(refreshed!);
      void this.indexVendor(refreshed!);
      return result;
    }

    void this.indexVendor(vendor);
    return toDto(vendor);
  }

  async findOwn(userId: string): Promise<VendorProfileDto> {
    const vendor = await this.repo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor profile not found');
    return toDto(vendor);
  }

  async findPublic(slug: string): Promise<VendorProfileDto> {
    const vendor = await this.repo.findBySlug(slug);
    if (!vendor || (vendor.status as VendorStatus) !== VendorStatus.APPROVED) {
      throw new NotFoundException('Vendor not found');
    }
    return toDto(vendor);
  }

  async update(userId: string, dto: UpdateVendorProfileDto): Promise<VendorProfileDto> {
    const vendor = await this.repo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const updateData: Parameters<typeof this.repo.update>[1] = {};
    if (dto.businessName !== undefined) updateData['businessName'] = dto.businessName;
    if (dto.description !== undefined) updateData['description'] = dto.description;
    if (dto.city !== undefined) updateData['city'] = dto.city;
    if (dto.address !== undefined) updateData['address'] = dto.address;
    if (dto.priceMin !== undefined) updateData['priceMin'] = dto.priceMin;
    if (dto.priceMax !== undefined) updateData['priceMax'] = dto.priceMax;
    if (dto.facebookUrl !== undefined) updateData['facebookUrl'] = dto.facebookUrl;
    if (dto.googleUrl !== undefined) updateData['googleUrl'] = dto.googleUrl;

    if (dto.categoryIds !== undefined) {
      await this.repo.syncCategories(vendor.id, dto.categoryIds);
    }

    const updated = await this.repo.update(vendor.id, updateData);
    void this.indexVendor(updated);
    return toDto(updated);
  }

  // ── portfolio images ─────────────────────────────────────────────────────────

  async uploadImage(userId: string, file: Express.Multer.File) {
    const vendor = await this.repo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const count = await this.repo.countImages(vendor.id);
    if (count >= MAX_IMAGES) {
      throw new BadRequestException(`Maximum of ${MAX_IMAGES} portfolio images allowed`);
    }

    const { publicId, url } = await this.cloudinary.uploadImage(file.buffer);

    const image = await this.repo.addImage({
      vendor: { connect: { id: vendor.id } },
      cloudinaryPublicId: publicId,
      url,
      order: count,
    });

    return image;
  }

  async deleteImage(userId: string, imageId: string) {
    const vendor = await this.repo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const image = await this.repo.findImage(imageId, vendor.id);
    if (!image) throw new NotFoundException('Image not found');

    await this.cloudinary.deleteImage(image.cloudinaryPublicId);
    await this.repo.deleteImage(imageId);
  }

  async reorderImages(userId: string, dto: ReorderImagesDto) {
    const vendor = await this.repo.findByUserId(userId);
    if (!vendor) throw new NotFoundException('Vendor profile not found');

    const vendorImageIds = new Set(vendor.images.map((i) => i.id));
    for (const item of dto.items) {
      if (!vendorImageIds.has(item.id)) {
        throw new ForbiddenException(`Image ${item.id} does not belong to this vendor`);
      }
    }

    await Promise.all(dto.items.map((item) => this.repo.updateImageOrder(item.id, item.order)));
  }

  // ── discovery ────────────────────────────────────────────────────────────────

  async search(dto: SearchVendorsDto): Promise<PaginatedResponse<VendorListItemDto>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 12;
    const skip = (page - 1) * limit;

    const conditions: Prisma.VendorProfileWhereInput[] = [
      { deletedAt: null },
      { status: VendorStatus.APPROVED },
    ];

    if (dto.city) conditions.push({ city: dto.city });
    if (dto.categorySlug) {
      conditions.push({ categories: { some: { category: { slug: dto.categorySlug } } } });
    }
    if (dto.priceMin !== undefined) {
      conditions.push({ OR: [{ priceMin: null }, { priceMin: { gte: dto.priceMin } }] });
    }
    if (dto.priceMax !== undefined) {
      conditions.push({ OR: [{ priceMax: null }, { priceMax: { lte: dto.priceMax } }] });
    }

    if (dto.q?.trim()) {
      const ids = await this.searchSvc.searchIds(dto.q.trim());

      if (ids !== null) {
        if (ids.length === 0) return toPage([], 0, page, limit);
        const where: Prisma.VendorProfileWhereInput = { AND: [...conditions, { id: { in: ids } }] };
        const { vendors, total } = await this.repo.findMany(where, skip, limit);
        return toPage(vendors.map(toListItemDto), total, page, limit);
      }

      // Meilisearch unavailable or index empty — MySQL LIKE fallback.
      // Covers the same fields Meilisearch searches (name, city, category, description)
      // so keyword queries like "photography" or "band" still return results.
      conditions.push({
        OR: [
          { businessName: { contains: dto.q } },
          { city: { contains: dto.q } },
          { description: { contains: dto.q } },
          { categories: { some: { category: { name: { contains: dto.q } } } } },
        ],
      });
    }

    const { vendors, total } = await this.repo.findMany({ AND: conditions }, skip, limit);
    return toPage(vendors.map(toListItemDto), total, page, limit);
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private indexVendor(vendor: NonNullable<Awaited<ReturnType<VendorsRepository['findBySlug']>>>) {
    return this.searchSvc.indexVendor({
      id: vendor.id,
      businessName: vendor.businessName,
      description: vendor.description,
      city: vendor.city,
      categoryNames: vendor.categories.map((vc) => vc.category.name),
      priceMin: vendor.priceMin,
      priceMax: vendor.priceMax,
      avgRating: vendor.avgRating,
      status: vendor.status,
      slug: vendor.slug,
    });
  }

  private async resolveUniqueSlug(base: string): Promise<string> {
    let slug = base;
    let attempt = 0;
    while (await this.repo.findBySlugExists(slug)) {
      attempt++;
      slug = `${base}-${attempt}`;
    }
    return slug;
  }
}

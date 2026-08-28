import type { VendorStatus } from './enums';
import type { CategoryDto } from './category';

export interface PortfolioImageDto {
  id: string;
  url: string;
  cloudinaryPublicId: string;
  order: number;
}

export interface VendorOwnerDto {
  name: string;
  phone: string | null;
}

export interface ExternalReviewDto {
  id: string;
  source: 'GOOGLE' | string;
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface VendorProfileDto {
  id: string;
  slug: string;
  businessName: string;
  description: string;
  city: string;
  address: string | null;
  priceMin: number | null;
  priceMax: number | null;
  status: VendorStatus;
  avgRating: number;
  reviewCount: number;
  facebookUrl: string | null;
  googleUrl: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  categories: CategoryDto[];
  images: PortfolioImageDto[];
  googleReviews: ExternalReviewDto[];
  owner: VendorOwnerDto;
  createdAt: string;
  updatedAt: string;
}

/** Lighter shape used in listing/search results (no description, no owner details) */
export interface VendorListItemDto {
  id: string;
  slug: string;
  businessName: string;
  city: string;
  priceMin: number | null;
  priceMax: number | null;
  avgRating: number;
  reviewCount: number;
  categories: CategoryDto[];
  images: PortfolioImageDto[];
}

export interface VendorSearchQuery {
  q?: string;
  categorySlug?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
}

import type { VendorStatus } from './enums';

export interface AdminVendorDto {
  id: string;
  slug: string;
  businessName: string;
  city: string;
  status: VendorStatus;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  owner: { id: string; name: string; email: string };
}

export interface AdminStatsDto {
  vendors: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
  };
  users: number;
  inquiries: number;
  reviews: number;
}

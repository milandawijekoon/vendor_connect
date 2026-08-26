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
    categories: CategoryDto[];
    images: PortfolioImageDto[];
    owner: VendorOwnerDto;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=vendor.d.ts.map
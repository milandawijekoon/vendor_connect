export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  /** Number of approved vendors in this category. Present on list endpoints. */
  vendorCount?: number;
}

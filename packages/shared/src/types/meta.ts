/** Aggregate marketplace figures for the public marketing surface. */
export interface PlatformStatsDto {
  /** Vendors with status APPROVED. */
  approvedVendors: number;
  /** Distinct cities that have at least one approved vendor. */
  cities: number;
  /** Mean rating across approved vendors that have at least one review (1 dp). */
  avgRating: number;
  /** Total reviews published. */
  reviews: number;
  /** Total inquiries sent through the platform. */
  inquiries: number;
}

/** One city with its approved-vendor count. */
export interface CityStatDto {
  city: string;
  vendorCount: number;
}

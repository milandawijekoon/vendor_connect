import { z } from 'zod';

export const vendorProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  city: z.string().min(2, 'City is required'),
  address: z.string().optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

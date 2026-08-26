export interface ReviewDto {
  id: string;
  vendorId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { name: string };
}

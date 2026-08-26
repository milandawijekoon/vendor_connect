/** Standard error shape returned by the API */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

/** Standard paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Common pagination query params */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

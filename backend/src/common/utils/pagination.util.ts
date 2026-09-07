export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    search: query.search || '',
    sortBy: query.sortBy || 'created_date',
    sortOrder: query.sortOrder || 'desc',
  };
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  limit: number
  offset: number
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

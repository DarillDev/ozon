export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

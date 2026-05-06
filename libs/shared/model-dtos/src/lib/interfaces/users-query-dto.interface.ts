export interface IUsersQueryDto {
  name?: string;
  sex?: 'male' | 'female';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

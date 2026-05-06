import { IPaginatedResponse } from '@ozon/shared/model-types';
import { IUserDto } from './user-dto.interface';

export type IUsersPageDto = IPaginatedResponse<IUserDto>;

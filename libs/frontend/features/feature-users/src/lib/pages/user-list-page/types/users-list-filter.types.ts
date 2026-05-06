import { IUsersQueryDto } from '@ozon/shared/model-dtos';

export type TUsersListFilter = Pick<IUsersQueryDto, 'limit' | 'page' | 'name'>;

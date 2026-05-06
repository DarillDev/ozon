import { Injectable } from '@nestjs/common';
import { IUsersQueryDto } from '@ozon/shared/model-dtos';
import { IPaginatedResponse } from '@ozon/shared/model-types';
import { generateMockUsers } from '../mocks/user.mock';
import { IUser } from '../models/interfaces/user.interface';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class UsersService {
  private readonly storage: Map<string, IUser>;

  constructor() {
    const users = generateMockUsers(1000);
    this.storage = new Map(users.map((u) => [u.id, u]));
  }

  public findAll(query: IUsersQueryDto = {}): IPaginatedResponse<IUser> {
    const {
      name,
      sex,
      isActive,
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
    } = query;

    let users = [...this.storage.values()];

    if (name) {
      const search = name.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(search));
    }

    if (sex !== undefined) {
      users = users.filter((u) => u.sex === sex);
    }

    if (isActive !== undefined) {
      users = users.filter((u) => u.isActive === isActive);
    }

    const total = users.length;
    const offset = (page - 1) * limit;

    return { data: users.slice(offset, offset + limit), total, page, limit };
  }

  public findById(id: string): IUser | null {
    return this.storage.get(id) ?? null;
  }
}

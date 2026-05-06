import { IUserDto } from '@ozon/shared/model-dtos';
import { IUser } from '../models/interfaces/user.interface';

export class UserMapper {
  static toDto(user: IUser): IUserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      balanceInRat: user.balanceInRat,
      isActive: user.isActive,
      sex: user.sex,
    };
  }
}

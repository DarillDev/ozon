import { Controller, Get, Query } from '@nestjs/common';
import { IUsersPageDto, IUsersQueryDto } from '@ozon/shared/model-dtos';
import { UserMapper } from '../mappers/user.mapper';
import { UsersService } from '../services/users.service';
import { firstValueFrom, timer } from 'rxjs';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  public getAll(@Query() query: IUsersQueryDto): IUsersPageDto {
    const { data, ...pagination } = this.usersService.findAll(query);

    return { data: data.map(UserMapper.toDto), ...pagination };
  }
}

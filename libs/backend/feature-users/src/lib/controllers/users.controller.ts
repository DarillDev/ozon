import { Controller, Get } from '@nestjs/common';
import { IUserDto } from '@ozon/shared/model-dtos';

@Controller('users')
export class UsersController {
  public get(): IUserDto {}
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('users')
  public users() {
    return ['User 1', 'User 2', 'User 3', 'User 4', 'User 5'];
  }
}

import { Controller, Get, Headers } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  getHello(@Headers() req): string {
    console.log(req)
    return this.appService.getHello();
  }
}

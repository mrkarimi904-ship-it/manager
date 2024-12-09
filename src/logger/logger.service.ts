import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService {
  findAll() {
    return `This action returns all logger`;
  }
}

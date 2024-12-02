import { Injectable } from '@nestjs/common';
import { DbService } from './db/db.service';

@Injectable()
export class AppService {
  constructor(private db: DbService) {}


  async getHello(): Promise<string> {
    return 'ok';
  }
}

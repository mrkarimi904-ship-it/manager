import { Controller } from '@nestjs/common';
import { LprQueueService } from './lpr_queue.service';

@Controller('lpr-queue')
export class LprQueueController {
  constructor(private readonly lprQueueService: LprQueueService) {}
}

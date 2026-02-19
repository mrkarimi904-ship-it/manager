import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DbService } from 'src/db/db.service';
import { RecorderService } from './recorder.service';

@Injectable()
export class RecorderScheduleService {
  constructor(private db: DbService, private recorderService: RecorderService) {}

  @Cron('0 * * * * *')
  async handleRecorderScheduleCron() {
    try {
      const scheduledRecorders = await this.db.camera_recorder_camera.findMany({
        where: { schedule_enabled: true },
        include: { camera: true, camera_recorder: true },
      });

      const now = new Date();
      const day = now.getDay(); // 0=Sun, 1=Mon, ... 6=Sat
      const hour = now.getHours(); // 0-23
      const slotIndex = day * 24 + hour;

      for (const rec of scheduledRecorders) {
        try {
          const slots = rec.schedule_slots || '';
          const slotActive = slots.length === 168 && slots[slotIndex] === '1';
          const cameraId = rec.camera[0]?.id;
          if (!cameraId) continue;

          if (slotActive && rec.status !== 'RUNNING') {
            await this.recorderService.start_item(
              { isSuperAdmin: true },
              cameraId,
              rec.id,
              { fromSchedule: true },
            );
          } else if (!slotActive && rec.status === 'RUNNING') {
            await this.recorderService.stop_item(
              { isSuperAdmin: true },
              cameraId,
              rec.id,
              { fromSchedule: true },
            );
          }
        } catch (err: any) {
          console.log('recorder schedule cron error for', rec.id, err?.message || err);
        }
      }
    } catch (error) {
      console.log('recorder schedule cron error', error?.message || error);
    }
  }
}

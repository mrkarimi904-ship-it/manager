import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { DbService } from 'src/db/db.service';
import { RecorderService } from './recorder.service';

function normalizeRecorderStatus(status: string | null | undefined): string {
  return (status || 'none').trim().toUpperCase();
}

function isScheduleSlotActive(slots: string, now: Date): boolean {
  if (!/^[01]{168}$/.test(slots || '')) {
    return false;
  }
  const slotIndex = now.getDay() * 24 + now.getHours();
  return slots[slotIndex] === '1';
}

function shouldStartScheduledRecorder(status: string | null | undefined): boolean {
  const normalized = normalizeRecorderStatus(status);
  return normalized !== 'RUNNING'
    && normalized !== 'PENDING'
    && normalized !== 'STARTING'
    && !normalized.startsWith('LOADING');
}

function shouldStopScheduledRecorder(status: string | null | undefined): boolean {
  const normalized = normalizeRecorderStatus(status);
  return normalized === 'RUNNING'
    || normalized === 'PENDING'
    || normalized === 'STARTING';
}

@Injectable()
export class RecorderScheduleService {
  constructor(
    private db: DbService,
    @Inject(forwardRef(() => RecorderService))
    private recorderService: RecorderService,
  ) {}

  async applyForRecorder(recorderId: string, now: Date = new Date()): Promise<void> {
    const rec = await this.db.camera_recorder_camera.findUnique({
      where: { id: recorderId },
      include: { camera: true, camera_recorder: true },
    });
    if (!rec?.schedule_enabled) {
      return;
    }
    await this.applyScheduleToRecorder(rec, now);
  }

  private async applyScheduleToRecorder(rec: any, now: Date): Promise<void> {
    const cameraId = rec.camera?.[0]?.id;
    if (!cameraId) {
      return;
    }

    const slotActive = isScheduleSlotActive(rec.schedule_slots || '', now);
    const status = rec.status;

    if (slotActive && shouldStartScheduledRecorder(status)) {
      await this.recorderService.start_item(
        { isSuperAdmin: true },
        cameraId,
        rec.id,
        { fromSchedule: true },
      );
      return;
    }

    if (!slotActive && shouldStopScheduledRecorder(status)) {
      await this.recorderService.stop_item(
        { isSuperAdmin: true },
        cameraId,
        rec.id,
        { fromSchedule: true },
      );
    }
  }

  @Cron('0 * * * * *')
  async handleRecorderScheduleCron() {
    try {
      const scheduledRecorders = await this.db.camera_recorder_camera.findMany({
        where: { schedule_enabled: true },
        include: { camera: true, camera_recorder: true },
      });

      const now = new Date();
      for (const rec of scheduledRecorders) {
        try {
          await this.applyForRecorder(rec.id, now);
        } catch (err: any) {
          console.log('recorder schedule cron error for', rec.id, err?.message || err);
        }
      }
    } catch (error) {
      console.log('recorder schedule cron error', error?.message || error);
    }
  }
}

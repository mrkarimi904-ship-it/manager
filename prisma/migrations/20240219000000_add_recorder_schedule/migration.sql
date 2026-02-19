-- AlterTable
ALTER TABLE "camera_recorder_camera" ADD COLUMN "schedule_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "camera_recorder_camera" ADD COLUMN "schedule_slots" TEXT NOT NULL DEFAULT '';

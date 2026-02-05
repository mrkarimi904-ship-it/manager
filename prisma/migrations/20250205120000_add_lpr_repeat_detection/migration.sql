-- AlterTable
ALTER TABLE "camera_lpr_camera" ADD COLUMN "repeat_detection" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "camera_lpr_camera" ADD COLUMN "repeat_threshold_seconds" INTEGER NOT NULL DEFAULT 0;

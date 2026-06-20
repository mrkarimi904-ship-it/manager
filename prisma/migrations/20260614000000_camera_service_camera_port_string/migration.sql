-- AlterTable
ALTER TABLE "camera_service_camera" ALTER COLUMN "port" TYPE TEXT USING "port"::text;
ALTER TABLE "camera_service_camera" ALTER COLUMN "port" SET DEFAULT '0';

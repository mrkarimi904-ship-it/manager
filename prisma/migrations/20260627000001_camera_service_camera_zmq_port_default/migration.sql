-- zmq_port uses 0 for idle streams
UPDATE "camera_service_camera" SET "zmq_port" = 0 WHERE "zmq_port" IS NULL;
ALTER TABLE "camera_service_camera" ALTER COLUMN "zmq_port" SET DEFAULT 0;
ALTER TABLE "camera_service_camera" ALTER COLUMN "zmq_port" SET NOT NULL;

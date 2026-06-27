-- Rename stream port to kafka_topic and add Kafka/ZMQ metadata fields
ALTER TABLE "camera_service_camera" RENAME COLUMN "port" TO "kafka_topic";

ALTER TABLE "camera_service_camera" ADD COLUMN "use_kafka" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "camera_service_camera" ADD COLUMN "use_service_ip" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "camera_service_camera" ADD COLUMN "zmq_port" INTEGER;
ALTER TABLE "camera_service_camera" ADD COLUMN "service_ip" TEXT;
ALTER TABLE "camera_service_camera" ADD COLUMN "kafka_server" TEXT;

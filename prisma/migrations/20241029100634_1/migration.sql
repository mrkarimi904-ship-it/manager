-- CreateTable
CREATE TABLE "camera" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_info" (
    "id" TEXT NOT NULL,
    "camera_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "camera_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_service" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "port_from" TEXT NOT NULL,
    "port_to" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_service_camera" (
    "id" TEXT NOT NULL,
    "camera_service_id" TEXT NOT NULL,
    "camera_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "camera_service_camera_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "camera_url_key" ON "camera"("url");

-- CreateIndex
CREATE UNIQUE INDEX "camera_service_url_key" ON "camera_service"("url");

-- AddForeignKey
ALTER TABLE "camera_info" ADD CONSTRAINT "camera_info_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camera_service_camera" ADD CONSTRAINT "camera_service_camera_camera_service_id_fkey" FOREIGN KEY ("camera_service_id") REFERENCES "camera_service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camera_service_camera" ADD CONSTRAINT "camera_service_camera_camera_id_fkey" FOREIGN KEY ("camera_id") REFERENCES "camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

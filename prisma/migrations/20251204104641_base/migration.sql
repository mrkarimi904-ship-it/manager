-- CreateTable
CREATE TABLE "user_accounts" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "expire_at" TIMESTAMP(3),
    "expireInterval" INTEGER NOT NULL DEFAULT 30,
    "mustchangepassword" BOOLEAN NOT NULL DEFAULT false,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "concurrent" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "totp_status" BOOLEAN NOT NULL DEFAULT false,
    "totp_secret" TEXT NOT NULL DEFAULT '',
    "totp_url" TEXT NOT NULL DEFAULT '',
    "online_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,
    "service" TEXT NOT NULL DEFAULT '',
    "ip" TEXT NOT NULL DEFAULT '',
    "mac" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preference" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "tcp" BOOLEAN NOT NULL DEFAULT true,
    "thirdParty" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_info" (
    "id" TEXT NOT NULL,
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
    "type" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'none',

    CONSTRAINT "camera_service_camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_recorder" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_recorder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_recorder_camera" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "quota" INTEGER NOT NULL,
    "block_size" INTEGER NOT NULL,
    "enable_rotation" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'none',
    "session" TEXT NOT NULL DEFAULT 'none',

    CONSTRAINT "camera_recorder_camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_playback" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_playback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_bookmark" (
    "id" TEXT NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "lock" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setting_password_complexity" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "minimumCharactersCount" INTEGER NOT NULL DEFAULT 8,
    "haveSpecialCharacters" BOOLEAN NOT NULL DEFAULT true,
    "haveUppercaseCharacters" BOOLEAN NOT NULL DEFAULT true,
    "haveLowercaseCharacters" BOOLEAN NOT NULL DEFAULT true,
    "haveDigits" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "setting_password_complexity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "key" TEXT NOT NULL DEFAULT '',
    "license" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "license_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "license_keys" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "public_key" TEXT NOT NULL DEFAULT '',
    "private_key" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "license_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logger_logs" (
    "id" TEXT NOT NULL,
    "log" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "by" TEXT,
    "user" TEXT,
    "user_group" TEXT,
    "camera" TEXT,
    "camera_group" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logger_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduler_user_account" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduler_user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduler_user_group" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduler_user_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduler_ip_mac" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "typee" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduler_ip_mac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_lpr" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camera_lpr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camera_lpr_camera" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "processType" DOUBLE PRECISION NOT NULL,
    "country" DOUBLE PRECISION NOT NULL,
    "useROI" BOOLEAN NOT NULL,
    "usePlateAlignment" BOOLEAN NOT NULL,
    "mustMatchPattern" BOOLEAN NOT NULL,
    "useGPU" BOOLEAN NOT NULL,
    "maxFPS" DOUBLE PRECISION NOT NULL,
    "useDetection" BOOLEAN NOT NULL,
    "detectionConfidenceTh" DOUBLE PRECISION NOT NULL,
    "segmentationConfidenceTh" DOUBLE PRECISION NOT NULL,
    "ocrConfidenceTh" DOUBLE PRECISION NOT NULL,
    "alprConfidenceTh" DOUBLE PRECISION NOT NULL,
    "postProcessConfidenceTh" DOUBLE PRECISION NOT NULL,
    "postProcessSkipLevelTh" DOUBLE PRECISION NOT NULL,
    "processStopLevelTh" DOUBLE PRECISION NOT NULL,
    "maxSuccessfulAnalysisCount" DOUBLE PRECISION NOT NULL,
    "maxAnalysisCount" DOUBLE PRECISION NOT NULL,
    "minPlateWidth" DOUBLE PRECISION NOT NULL,
    "min2AnalysisInterval" DOUBLE PRECISION NOT NULL,
    "useTypeAndModelRecognition" BOOLEAN NOT NULL,
    "typeModelRecognitionSkipLevelTh" DOUBLE PRECISION NOT NULL,
    "typeModelRecognitionStopLevelTh" DOUBLE PRECISION NOT NULL,
    "useColorRecognition" BOOLEAN NOT NULL,
    "colorRecognitionSkipLevelTh" DOUBLE PRECISION NOT NULL,
    "colorRecognitionStopLevelTh" DOUBLE PRECISION NOT NULL,
    "trackingDistanceTh" DOUBLE PRECISION NOT NULL,
    "trackingInactiveTh" DOUBLE PRECISION NOT NULL,
    "trackingActiveTh" DOUBLE PRECISION NOT NULL,
    "tickCount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'none',
    "session" TEXT NOT NULL DEFAULT 'none',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "roi" TEXT,
    "roiData" TEXT,

    CONSTRAINT "camera_lpr_camera_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mismatch_service" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mismatch_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mismatch" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "camera1_id" TEXT NOT NULL,
    "camera2_id" TEXT NOT NULL,
    "delay" DOUBLE PRECISION NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'STOPPED',
    "session" TEXT NOT NULL DEFAULT 'none',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mismatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lpr_result" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "lineid" TEXT NOT NULL,
    "ocr" TEXT NOT NULL,
    "platetype" TEXT NOT NULL,
    "trackid" TEXT NOT NULL,
    "vehiclebrand" TEXT NOT NULL,
    "vehiclecolor" TEXT NOT NULL,
    "vehiclemodel" TEXT NOT NULL,
    "vehicletype" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "isBlackList" BOOLEAN NOT NULL,
    "isWhiteList" BOOLEAN NOT NULL,
    "isNotifable" BOOLEAN NOT NULL DEFAULT false,
    "camAddress" TEXT NOT NULL DEFAULT '',
    "camMapLat" TEXT NOT NULL DEFAULT '',
    "camMapLng" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lpr_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lpr_result_image" (
    "id" TEXT NOT NULL,
    "plateimage" TEXT NOT NULL,
    "vehicleimage" TEXT NOT NULL,
    "frame" TEXT NOT NULL,
    "generatedplateimage" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lpr_result_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lpr_list" (
    "id" TEXT NOT NULL,
    "ocr" TEXT NOT NULL,
    "vehiclebrand" TEXT NOT NULL,
    "vehiclecolor" TEXT NOT NULL,
    "vehiclemodel" TEXT NOT NULL,
    "vehicletype" TEXT NOT NULL,
    "drivername" TEXT NOT NULL,
    "driverfamily" TEXT NOT NULL,
    "driverphone" TEXT NOT NULL,
    "driverdesc" TEXT NOT NULL,
    "alarmText" TEXT NOT NULL,
    "alarmColor" TEXT NOT NULL,
    "isBlackList" BOOLEAN NOT NULL,
    "isWhiteList" BOOLEAN NOT NULL,
    "isPartial" BOOLEAN NOT NULL,
    "isNotifable" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lpr_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lpr_list_image" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lpr_list_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "port_count" INTEGER NOT NULL DEFAULT 6,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" TEXT NOT NULL,
    "lpr_list_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled_from" TEXT NOT NULL,
    "enabled_to" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'idle',
    "port" INTEGER NOT NULL,
    "step1_action" TEXT NOT NULL,
    "step1_delay_ms" INTEGER NOT NULL,
    "step2_action" TEXT,
    "step2_delay_ms" INTEGER,
    "cameras" JSONB,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tileview" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tileview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_user_accountsTouser_groups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_user_accountsTouser_groups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_user_accountsTouser_roles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_user_accountsTouser_roles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_user_accountsTouser_tokens" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_user_accountsTouser_tokens_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_user_accountsTouser_preference" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_user_accountsTouser_preference_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_user_groupsTouser_roles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_user_groupsTouser_roles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTocamera_info" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTocamera_info_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTocamera_service_camera" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTocamera_service_camera_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTocamera_recorder_camera" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTocamera_recorder_camera_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTocamera_lpr_camera" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTocamera_lpr_camera_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTolpr_result" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTolpr_result_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTouser_accounts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTouser_accounts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTocamera_groups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTocamera_groups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTouser_groups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTouser_groups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_cameraTocamera_bookmark" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_cameraTocamera_bookmark_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_camera_groupsTouser_accounts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_camera_groupsTouser_accounts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_camera_groupsTouser_groups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_camera_groupsTouser_groups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_camera_serviceTocamera_service_camera" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_camera_serviceTocamera_service_camera_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_camera_recorderTocamera_recorder_camera" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_camera_recorderTocamera_recorder_camera_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_scheduler_user_accountTouser_accounts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_scheduler_user_accountTouser_accounts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_scheduler_user_groupTouser_groups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_scheduler_user_groupTouser_groups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_scheduler_ip_macTouser_accounts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_scheduler_ip_macTouser_accounts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_camera_lprTocamera_lpr_camera" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_camera_lprTocamera_lpr_camera_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_mismatchTomismatch_service" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_mismatchTomismatch_service_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_lpr_resultTolpr_result_image" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_lpr_resultTolpr_result_image_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_lpr_listTolpr_list_image" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_lpr_listTolpr_list_image_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TileviewUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TileviewUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TileviewUserGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TileviewUserGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_username_key" ON "user_accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_name_key" ON "user_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "camera_url_key" ON "camera"("url");

-- CreateIndex
CREATE UNIQUE INDEX "camera_service_url_key" ON "camera_service"("url");

-- CreateIndex
CREATE UNIQUE INDEX "camera_recorder_url_key" ON "camera_recorder"("url");

-- CreateIndex
CREATE UNIQUE INDEX "camera_playback_url_key" ON "camera_playback"("url");

-- CreateIndex
CREATE UNIQUE INDEX "camera_lpr_url_key" ON "camera_lpr"("url");

-- CreateIndex
CREATE UNIQUE INDEX "mismatch_service_url_key" ON "mismatch_service"("url");

-- CreateIndex
CREATE UNIQUE INDEX "device_url_key" ON "device"("url");

-- CreateIndex
CREATE INDEX "_user_accountsTouser_groups_B_index" ON "_user_accountsTouser_groups"("B");

-- CreateIndex
CREATE INDEX "_user_accountsTouser_roles_B_index" ON "_user_accountsTouser_roles"("B");

-- CreateIndex
CREATE INDEX "_user_accountsTouser_tokens_B_index" ON "_user_accountsTouser_tokens"("B");

-- CreateIndex
CREATE INDEX "_user_accountsTouser_preference_B_index" ON "_user_accountsTouser_preference"("B");

-- CreateIndex
CREATE INDEX "_user_groupsTouser_roles_B_index" ON "_user_groupsTouser_roles"("B");

-- CreateIndex
CREATE INDEX "_cameraTocamera_info_B_index" ON "_cameraTocamera_info"("B");

-- CreateIndex
CREATE INDEX "_cameraTocamera_service_camera_B_index" ON "_cameraTocamera_service_camera"("B");

-- CreateIndex
CREATE INDEX "_cameraTocamera_recorder_camera_B_index" ON "_cameraTocamera_recorder_camera"("B");

-- CreateIndex
CREATE INDEX "_cameraTocamera_lpr_camera_B_index" ON "_cameraTocamera_lpr_camera"("B");

-- CreateIndex
CREATE INDEX "_cameraTolpr_result_B_index" ON "_cameraTolpr_result"("B");

-- CreateIndex
CREATE INDEX "_cameraTouser_accounts_B_index" ON "_cameraTouser_accounts"("B");

-- CreateIndex
CREATE INDEX "_cameraTocamera_groups_B_index" ON "_cameraTocamera_groups"("B");

-- CreateIndex
CREATE INDEX "_cameraTouser_groups_B_index" ON "_cameraTouser_groups"("B");

-- CreateIndex
CREATE INDEX "_cameraTocamera_bookmark_B_index" ON "_cameraTocamera_bookmark"("B");

-- CreateIndex
CREATE INDEX "_camera_groupsTouser_accounts_B_index" ON "_camera_groupsTouser_accounts"("B");

-- CreateIndex
CREATE INDEX "_camera_groupsTouser_groups_B_index" ON "_camera_groupsTouser_groups"("B");

-- CreateIndex
CREATE INDEX "_camera_serviceTocamera_service_camera_B_index" ON "_camera_serviceTocamera_service_camera"("B");

-- CreateIndex
CREATE INDEX "_camera_recorderTocamera_recorder_camera_B_index" ON "_camera_recorderTocamera_recorder_camera"("B");

-- CreateIndex
CREATE INDEX "_scheduler_user_accountTouser_accounts_B_index" ON "_scheduler_user_accountTouser_accounts"("B");

-- CreateIndex
CREATE INDEX "_scheduler_user_groupTouser_groups_B_index" ON "_scheduler_user_groupTouser_groups"("B");

-- CreateIndex
CREATE INDEX "_scheduler_ip_macTouser_accounts_B_index" ON "_scheduler_ip_macTouser_accounts"("B");

-- CreateIndex
CREATE INDEX "_camera_lprTocamera_lpr_camera_B_index" ON "_camera_lprTocamera_lpr_camera"("B");

-- CreateIndex
CREATE INDEX "_mismatchTomismatch_service_B_index" ON "_mismatchTomismatch_service"("B");

-- CreateIndex
CREATE INDEX "_lpr_resultTolpr_result_image_B_index" ON "_lpr_resultTolpr_result_image"("B");

-- CreateIndex
CREATE INDEX "_lpr_listTolpr_list_image_B_index" ON "_lpr_listTolpr_list_image"("B");

-- CreateIndex
CREATE INDEX "_TileviewUser_B_index" ON "_TileviewUser"("B");

-- CreateIndex
CREATE INDEX "_TileviewUserGroup_B_index" ON "_TileviewUserGroup"("B");

-- AddForeignKey
ALTER TABLE "mismatch" ADD CONSTRAINT "mismatch_camera1_id_fkey" FOREIGN KEY ("camera1_id") REFERENCES "camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mismatch" ADD CONSTRAINT "mismatch_camera2_id_fkey" FOREIGN KEY ("camera2_id") REFERENCES "camera"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_lpr_list_id_fkey" FOREIGN KEY ("lpr_list_id") REFERENCES "lpr_list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tileview" ADD CONSTRAINT "tileview_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_accountsTouser_groups" ADD CONSTRAINT "_user_accountsTouser_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_accountsTouser_groups" ADD CONSTRAINT "_user_accountsTouser_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_accountsTouser_roles" ADD CONSTRAINT "_user_accountsTouser_roles_A_fkey" FOREIGN KEY ("A") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_accountsTouser_roles" ADD CONSTRAINT "_user_accountsTouser_roles_B_fkey" FOREIGN KEY ("B") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_accountsTouser_tokens" ADD CONSTRAINT "_user_accountsTouser_tokens_A_fkey" FOREIGN KEY ("A") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_accountsTouser_tokens" ADD CONSTRAINT "_user_accountsTouser_tokens_B_fkey" FOREIGN KEY ("B") REFERENCES "user_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_accountsTouser_preference" ADD CONSTRAINT "_user_accountsTouser_preference_A_fkey" FOREIGN KEY ("A") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_accountsTouser_preference" ADD CONSTRAINT "_user_accountsTouser_preference_B_fkey" FOREIGN KEY ("B") REFERENCES "user_preference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_groupsTouser_roles" ADD CONSTRAINT "_user_groupsTouser_roles_A_fkey" FOREIGN KEY ("A") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_groupsTouser_roles" ADD CONSTRAINT "_user_groupsTouser_roles_B_fkey" FOREIGN KEY ("B") REFERENCES "user_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_info" ADD CONSTRAINT "_cameraTocamera_info_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_info" ADD CONSTRAINT "_cameraTocamera_info_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_info"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_service_camera" ADD CONSTRAINT "_cameraTocamera_service_camera_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_service_camera" ADD CONSTRAINT "_cameraTocamera_service_camera_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_service_camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_recorder_camera" ADD CONSTRAINT "_cameraTocamera_recorder_camera_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_recorder_camera" ADD CONSTRAINT "_cameraTocamera_recorder_camera_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_recorder_camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_lpr_camera" ADD CONSTRAINT "_cameraTocamera_lpr_camera_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_lpr_camera" ADD CONSTRAINT "_cameraTocamera_lpr_camera_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_lpr_camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTolpr_result" ADD CONSTRAINT "_cameraTolpr_result_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTolpr_result" ADD CONSTRAINT "_cameraTolpr_result_B_fkey" FOREIGN KEY ("B") REFERENCES "lpr_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTouser_accounts" ADD CONSTRAINT "_cameraTouser_accounts_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTouser_accounts" ADD CONSTRAINT "_cameraTouser_accounts_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_groups" ADD CONSTRAINT "_cameraTocamera_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_groups" ADD CONSTRAINT "_cameraTocamera_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTouser_groups" ADD CONSTRAINT "_cameraTouser_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTouser_groups" ADD CONSTRAINT "_cameraTouser_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_bookmark" ADD CONSTRAINT "_cameraTocamera_bookmark_A_fkey" FOREIGN KEY ("A") REFERENCES "camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_cameraTocamera_bookmark" ADD CONSTRAINT "_cameraTocamera_bookmark_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_bookmark"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_groupsTouser_accounts" ADD CONSTRAINT "_camera_groupsTouser_accounts_A_fkey" FOREIGN KEY ("A") REFERENCES "camera_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_groupsTouser_accounts" ADD CONSTRAINT "_camera_groupsTouser_accounts_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_groupsTouser_groups" ADD CONSTRAINT "_camera_groupsTouser_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "camera_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_groupsTouser_groups" ADD CONSTRAINT "_camera_groupsTouser_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_serviceTocamera_service_camera" ADD CONSTRAINT "_camera_serviceTocamera_service_camera_A_fkey" FOREIGN KEY ("A") REFERENCES "camera_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_serviceTocamera_service_camera" ADD CONSTRAINT "_camera_serviceTocamera_service_camera_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_service_camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_recorderTocamera_recorder_camera" ADD CONSTRAINT "_camera_recorderTocamera_recorder_camera_A_fkey" FOREIGN KEY ("A") REFERENCES "camera_recorder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_recorderTocamera_recorder_camera" ADD CONSTRAINT "_camera_recorderTocamera_recorder_camera_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_recorder_camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_scheduler_user_accountTouser_accounts" ADD CONSTRAINT "_scheduler_user_accountTouser_accounts_A_fkey" FOREIGN KEY ("A") REFERENCES "scheduler_user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_scheduler_user_accountTouser_accounts" ADD CONSTRAINT "_scheduler_user_accountTouser_accounts_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_scheduler_user_groupTouser_groups" ADD CONSTRAINT "_scheduler_user_groupTouser_groups_A_fkey" FOREIGN KEY ("A") REFERENCES "scheduler_user_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_scheduler_user_groupTouser_groups" ADD CONSTRAINT "_scheduler_user_groupTouser_groups_B_fkey" FOREIGN KEY ("B") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_scheduler_ip_macTouser_accounts" ADD CONSTRAINT "_scheduler_ip_macTouser_accounts_A_fkey" FOREIGN KEY ("A") REFERENCES "scheduler_ip_mac"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_scheduler_ip_macTouser_accounts" ADD CONSTRAINT "_scheduler_ip_macTouser_accounts_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_lprTocamera_lpr_camera" ADD CONSTRAINT "_camera_lprTocamera_lpr_camera_A_fkey" FOREIGN KEY ("A") REFERENCES "camera_lpr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_camera_lprTocamera_lpr_camera" ADD CONSTRAINT "_camera_lprTocamera_lpr_camera_B_fkey" FOREIGN KEY ("B") REFERENCES "camera_lpr_camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mismatchTomismatch_service" ADD CONSTRAINT "_mismatchTomismatch_service_A_fkey" FOREIGN KEY ("A") REFERENCES "mismatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_mismatchTomismatch_service" ADD CONSTRAINT "_mismatchTomismatch_service_B_fkey" FOREIGN KEY ("B") REFERENCES "mismatch_service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lpr_resultTolpr_result_image" ADD CONSTRAINT "_lpr_resultTolpr_result_image_A_fkey" FOREIGN KEY ("A") REFERENCES "lpr_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lpr_resultTolpr_result_image" ADD CONSTRAINT "_lpr_resultTolpr_result_image_B_fkey" FOREIGN KEY ("B") REFERENCES "lpr_result_image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lpr_listTolpr_list_image" ADD CONSTRAINT "_lpr_listTolpr_list_image_A_fkey" FOREIGN KEY ("A") REFERENCES "lpr_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_lpr_listTolpr_list_image" ADD CONSTRAINT "_lpr_listTolpr_list_image_B_fkey" FOREIGN KEY ("B") REFERENCES "lpr_list_image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TileviewUser" ADD CONSTRAINT "_TileviewUser_A_fkey" FOREIGN KEY ("A") REFERENCES "tileview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TileviewUser" ADD CONSTRAINT "_TileviewUser_B_fkey" FOREIGN KEY ("B") REFERENCES "user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TileviewUserGroup" ADD CONSTRAINT "_TileviewUserGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "tileview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TileviewUserGroup" ADD CONSTRAINT "_TileviewUserGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

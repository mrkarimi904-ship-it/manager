-- CreateTable
CREATE TABLE "setting_backup_restore" (
    "id" TEXT NOT NULL,
    "postgres_data_path" TEXT NOT NULL DEFAULT '/var/lib/postgresql/data',
    "minio_data_path" TEXT NOT NULL DEFAULT '/data',
    "disk_space_start_archive_percent" INTEGER NOT NULL DEFAULT 20,
    "disk_space_stop_archive_percent" INTEGER NOT NULL DEFAULT 30,
    "disk_space_critical_percent" INTEGER NOT NULL DEFAULT 5,
    "lpr_backup_batch_size" INTEGER NOT NULL DEFAULT 1000,
    "lpr_backup_min_age_days" INTEGER NOT NULL DEFAULT 7,
    "logger_backup_keep_count" INTEGER NOT NULL DEFAULT 100000,
    "logger_backup_batch_size" INTEGER NOT NULL DEFAULT 50000,
    "rotation_backup_type" TEXT NOT NULL DEFAULT 'local',
    "rotation_backup_local_path" TEXT NOT NULL DEFAULT '/mnt/backup-storage/lpr-archives',
    "rotation_backup_s3_endpoint" TEXT NOT NULL DEFAULT '',
    "rotation_backup_s3_bucket" TEXT NOT NULL DEFAULT '',
    "rotation_backup_s3_access_key" TEXT NOT NULL DEFAULT '',
    "rotation_backup_s3_secret_key" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setting_backup_restore_pkey" PRIMARY KEY ("id")
);

-- Insert default row
INSERT INTO "setting_backup_restore" ("id", "updated_at") VALUES ('main', NOW());

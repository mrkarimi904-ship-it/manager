-- AlterTable
ALTER TABLE "setting_backup_restore" ADD COLUMN "lpr_backup_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "setting_backup_restore" ADD COLUMN "logger_backup_enabled" BOOLEAN NOT NULL DEFAULT false;

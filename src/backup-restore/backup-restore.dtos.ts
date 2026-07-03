import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestoreBackupDto {
  @ApiProperty({ example: 'lpr_backup_2026-07-01T12-00-00-000Z_....zip' })
  @IsString()
  filename: string;
}

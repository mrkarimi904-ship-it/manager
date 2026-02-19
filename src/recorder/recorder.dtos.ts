import { IsBoolean, IsNumber, IsString, IsUUID, Length, Matches, Min } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class recorderDto {
  @IsString()
  @IsUUID()
  @ApiProperty()
  cameraId: string;
}

export class recorderPostDto {
  @IsString()
  @ApiProperty()
  recorder: string;

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  storage_path: string;

  @IsNumber()
  @Min(1024)
  @ApiProperty()
  quota: number = 1024;

  @IsNumber()
  @Min(100)
  @ApiProperty()
  block_size: number = 100;

  @IsBoolean()
  @ApiProperty()
  enable_rotation: boolean = true;
}

export class recorderStorageCheckDto {
  @IsString()
  @ApiProperty({ example: '/storage', description: 'Storage path to check on the recorder service' })
  path: string;

  @IsString()
  @ApiProperty({ description: 'Camera recorder server id (camera_recorder id)' })
  recorder: string;
}

export class recorderPutDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsBoolean()
  @ApiProperty()
  enable_rotation: boolean = true;
}

export class recorderScheduleDto {
  @IsBoolean()
  @ApiProperty()
  schedule_enabled: boolean;

  @IsString()
  @Length(168, 168)
  @Matches(/^[01]{168}$/, { message: 'schedule_slots must be exactly 168 characters of 0 or 1' })
  @ApiProperty({ description: '168 chars: day*24+hour, "0"=off "1"=on, day 0=Sun..6=Sat' })
  schedule_slots: string;
}
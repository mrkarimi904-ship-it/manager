import { IsBoolean, IsNumber, IsString, IsUUID, Min } from 'class-validator';
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

export class recorderPutDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsBoolean()
  @ApiProperty()
  enable_rotation: boolean = true;
}
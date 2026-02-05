import { IsString, IsUUID, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateMismatchDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsUUID()
  @ApiProperty()
  mismatch_service_id: string;

  @IsUUID()
  @ApiProperty()
  camera1_id: string;

  @IsUUID()
  @ApiProperty()
  camera2_id: string;

  @IsNumber()
  @ApiProperty()
  delay: number;
}

export class UpdateMismatchDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  title?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  isActive?: boolean;
}

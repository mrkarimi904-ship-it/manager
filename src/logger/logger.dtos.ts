import { IsString,IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";


export class logSearchDto {
  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @IsString()
  pageSize?: string;

  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsString()
  pageIndex: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  userFilter: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  userGroupId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  userGroupFilter: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  cameraId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  cameraFilter: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  cameraGroupId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  cameraGroupFilter: string;

  @ApiProperty({ default: '0', required: false })
  @IsOptional()
  @IsString()
  level: string;
}

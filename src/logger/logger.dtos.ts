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
  byId: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  userGroupId: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  cameraId: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  cameraGroupId: string;

  @ApiProperty({ default: '0', required: false })
  @IsOptional()
  @IsString()
  level: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  from: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  to: string;
}

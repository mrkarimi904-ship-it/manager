import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiParam, ApiProperty, ApiQuery, getSchemaPath } from "@nestjs/swagger";

enum cameraTypeDto {
  UNKNOWN,
  DOME,
  BULLET
}

export class cameraDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @ApiProperty()
  password: string;
}

export class postPreCameraDto {
  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @ApiProperty()
  password: string;
}

export class postCameraDto {
  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  profile_low: string;

  @IsString()
  @ApiProperty()
  profile_high: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsEnum(cameraTypeDto)
  @ApiProperty()
  type: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsString()
  @ApiProperty()
  brand: string;

  @IsString()
  @ApiProperty()
  partnumber: string;

  @IsString()
  @ApiProperty()
  map_lat: string;

  @IsString()
  @ApiProperty()
  map_lng: string;

  @IsBoolean()
  @ApiProperty()
  tcp: boolean;
}

export class cameraSearchQuery {
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
  cameraGroupId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  cameraGroupFilter: string;

  @ApiProperty({ default: 'false', required: false })
  @IsOptional()
  @IsString()
  directOnly: string;
}

export class nameDto {
  @ApiProperty()
  @IsString()
  name: string;
}

export class groupSearchQuery {
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
}














export class editCameraDto {
  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  username: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsEnum(cameraTypeDto)
  @ApiProperty()
  type: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  address: string;

  @IsString()
  @ApiProperty()
  brand: string;

  @IsString()
  @ApiProperty()
  partnumber: string;

  @IsString()
  @ApiProperty()
  map_lat: string;

  @IsString()
  @ApiProperty()
  map_lng: string;

  @IsBoolean()
  @ApiProperty()
  tcp: boolean;
}

export class editCameraProfileDto {
  @IsString()
  @ApiProperty()
  profile_low: string;

  @IsString()
  @ApiProperty()
  profile_high: string;
}
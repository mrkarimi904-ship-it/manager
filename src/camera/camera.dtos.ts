import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Matches, MaxLength } from 'class-validator';
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
  @Matches(/^[1-9]\d*$/, { message: 'pageSize must be a positive integer' })
  pageSize?: string;

  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/, { message: 'pageIndex must be a positive integer' })
  pageIndex: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'search string must be less than 200 characters' })
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

  @ApiProperty({ default: 'false', required: false })
  @IsOptional()
  @IsString()
  deletedIncluded: string;

  @ApiProperty({ required: false, description: 'Camera type filter: DOME, BULLET, UNKNOWN (comma-separated)' })
  @IsOptional()
  @IsString()
  cameraType?: string;

  @ApiProperty({ required: false, description: 'Connection: Local or ThirdParty' })
  @IsOptional()
  @IsString()
  connectionType?: string;

  @ApiProperty({ required: false, description: 'Profile type: Low or High' })
  @IsOptional()
  @IsString()
  cameraProfileType?: string;

  @ApiProperty({ required: false, description: 'Has ONVIF profile: true or false' })
  @IsOptional()
  @IsString()
  hasProfile?: string;

  @ApiProperty({ required: false, description: 'Connection status: Connected or Disconnected' })
  @IsOptional()
  @IsString()
  connectionStatus?: string;

  @ApiProperty({ required: false, description: 'Recorder status: Recording, NotRecording, NoRecorder (comma-separated)' })
  @IsOptional()
  @IsString()
  recorderStatus?: string;

  @ApiProperty({ required: false, description: 'PTZ type: Fixed, Motorized, PTZ (comma-separated)' })
  @IsOptional()
  @IsString()
  ptzType?: string;

  @ApiProperty({ required: false, description: 'LPR status: Running, NotRunning, NoLpr (comma-separated)' })
  @IsOptional()
  @IsString()
  lprStatus?: string;
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
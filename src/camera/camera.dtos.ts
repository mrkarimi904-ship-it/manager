import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

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
}
import { IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class cameraServiceDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  port_from: string;

  @IsString()
  @ApiProperty()
  port_to: string;
}

export class postCameraServiceDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  port_from: string;

  @IsString()
  @ApiProperty()
  port_to: string;

  @IsString()
  @ApiProperty()
  swagger_port: string;
}
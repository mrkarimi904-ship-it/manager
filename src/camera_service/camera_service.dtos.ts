import { IsString, IsUUID } from 'class-validator';
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
  @IsUUID('4')
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
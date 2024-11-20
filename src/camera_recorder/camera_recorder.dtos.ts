import { IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class cameraRecorderDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  url: string;
}

export class postCameraRecorderDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  swagger_port: string;
}
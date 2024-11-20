import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class liveDto {
  @IsString()
  @IsUUID()
  @ApiProperty()
  cameraId: string;
}
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class recorderDto {
  @IsString()
  @IsUUID()
  @ApiProperty()
  cameraId: string;
}
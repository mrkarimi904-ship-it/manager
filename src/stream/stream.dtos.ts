import { IsEnum, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

enum profileType {
  LOW,
  HIGH
}
export class streamDto {
  @IsString()
  @IsUUID()
  @ApiProperty()
  cameraId: string;

  @IsEnum(profileType)
  @ApiProperty()
  type: string;
}
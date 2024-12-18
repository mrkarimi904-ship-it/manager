import { IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreatePlaybackDto {
  @IsString()
  @ApiProperty()
  session: string;
}

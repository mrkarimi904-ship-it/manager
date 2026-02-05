import { IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class mismatchServiceDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  url: string;
}

export class postMismatchServiceDto {
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

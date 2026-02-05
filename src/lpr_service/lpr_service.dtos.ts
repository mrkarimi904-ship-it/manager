import { IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class lprServiceDto {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  url: string;
}

export class postLprServiceDto {
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
import { IsString, IsUUID } from 'class-validator';
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
  @IsUUID('4')
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @ApiProperty()
  swagger_port: string;
}
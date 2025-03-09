import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, isBoolean } from 'class-validator';
import { ApiParam, ApiProperty, ApiQuery, getSchemaPath } from "@nestjs/swagger";

export class bookmarkDto {
  @IsNumber()
  @ApiProperty()
  from: number;

  @IsNumber()
  @ApiProperty()
  to: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  type: string;

  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsBoolean()
  @ApiProperty()
  lock: boolean;
}

export class bookmarkSearchQuery {
  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  search: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  from: number;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  to: number;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  type: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  lock: string;
}

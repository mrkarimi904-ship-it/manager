import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class scheduleDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  from: string;

  @IsString()
  @ApiProperty()
  to: string;
}

export class scheduleEditDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  from: string;

  @IsString()
  @ApiProperty()
  to: string;
}


export class scheduleSearchDto {
  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @IsString()
  pageSize?: string;

  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsString()
  pageIndex: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  search: string;
}
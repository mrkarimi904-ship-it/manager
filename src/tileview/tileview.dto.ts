import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class tileviewDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  schema: string;

  @ApiProperty()
  @IsString()
  meta: string;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  private?: boolean;
}

export class tileviewEditDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  schema?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  meta?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  private?: boolean;
}

export class tileviewSearchQuery {
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

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  userId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  userFilter: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  userGroupId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  userGroupFilter: string;
}


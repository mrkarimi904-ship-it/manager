import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class tilelayoutDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  schema: string;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  private?: boolean;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_editable?: boolean;
}

export class tilelayoutEditDto {
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
  @IsBoolean()
  private?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_editable?: boolean;
}

export class tilelayoutSearchQuery {
  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @IsString()
  pageSize?: string;

  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @IsString()
  pageIndex?: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}

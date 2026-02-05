import { IsString, IsNotEmpty, IsInt, IsOptional, Min, Max, IsBoolean, IsArray, IsIn, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export class CreateOperationDto {
  @ApiProperty({ description: 'LPR List ID' })
  @IsString()
  @IsNotEmpty()
  lpr_list_id: string;

  @ApiProperty({ description: 'Device ID' })
  @IsString()
  @IsNotEmpty()
  device_id: string;

  @ApiProperty({ description: 'Operation name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Enable time (HH:MM format)', example: '08:00' })
  @IsString()
  @IsNotEmpty()
  enabled_from: string;

  @ApiProperty({ description: 'Disable time (HH:MM format)', example: '16:00' })
  @IsString()
  @IsNotEmpty()
  enabled_to: string;

  @ApiProperty({ description: 'Operation active status', default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @ApiProperty({ description: 'Device port (1-6)' })
  @IsInt()
  @Min(1)
  @Max(6)
  port: number;

  @ApiProperty({ description: 'Step 1 action', enum: ['open', 'close', 'pulse'] })
  @IsString()
  @IsIn(['open', 'close', 'pulse'])
  step1_action: string;

  @ApiProperty({ description: 'Step 1 delay in milliseconds' })
  @IsInt()
  @Min(0)
  step1_delay_ms: number;

  @ApiProperty({ description: 'Step 2 action (optional)', enum: ['open', 'close', 'pulse'], required: false })
  @IsString()
  @IsIn(['open', 'close', 'pulse'])
  @IsOptional()
  step2_action?: string;

  @ApiProperty({ description: 'Step 2 delay in milliseconds (optional)', required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  step2_delay_ms?: number;

  @ApiProperty({ description: 'Camera IDs array (optional)', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cameras?: string[];
}

export class UpdateOperationDto extends PartialType(CreateOperationDto) {}

export class operationSearchQuery {
  @IsOptional()
  @ApiProperty({ required: false })
  @Matches(/^[1-9]\d*$/, { message: 'pageSize must be a positive integer' })
  pageSize?: string = '20';

  @IsOptional()
  @ApiProperty({ required: false })
  @Matches(/^[1-9]\d*$/, { message: 'pageIndex must be a positive integer' })
  pageIndex?: string = '1';

  @IsOptional()
  @ApiProperty({ required: false })
  search?: string = '';
}

import { IsString, IsNotEmpty, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ description: 'Device name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Device URL/IP address' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Device username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Device password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Number of ports (1-6)', default: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  @IsOptional()
  port_count?: number = 6;
}

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}

export class deviceSearchQuery {
  @IsOptional()
  @ApiProperty({ required: false })
  pageSize?: string = '20';

  @IsOptional()
  @ApiProperty({ required: false })
  pageIndex?: string = '1';

  @IsOptional()
  @ApiProperty({ required: false })
  search?: string = '';
}

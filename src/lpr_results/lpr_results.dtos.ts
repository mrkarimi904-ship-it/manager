import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsBooleanString, IsDateString } from 'class-validator';
import { ApiParam, ApiProperty, ApiPropertyOptional, ApiQuery, getSchemaPath } from "@nestjs/swagger";

export class lprSearchQuery {
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
    brand: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    model: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    type: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    color: string;

    @ApiProperty({ default: 'Car', required: false })
    @IsOptional()
    @IsString()
    plateType: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    address: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isBlackList: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isWhiteList: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isNotifable: string;

    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional()
    dateFrom: string;

    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional()
    dateTo: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Comma-separated camera IDs (one or more)' })
    cameraIds: string;
}

export class lprReportQuery {
    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    search: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    brand: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    model: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    type: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    color: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    address: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isBlackList: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isWhiteList: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isNotifable: string;

    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional()
    dateFrom: string;

    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional()
    dateTo: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Comma-separated camera IDs (one or more)' })
    cameraIds: string;
}

export class lprExportQuery {
    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    search: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    brand: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    model: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    type: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    color: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    address: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isBlackList: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isWhiteList: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isNotifable: string;

    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional()
    dateFrom: string;

    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional()
    dateTo: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    deleteFromDatabase: string;

    @IsOptional()
    @ApiPropertyOptional()
    @IsString()
    limit?: string;
}

export class lprUpdateItem {
    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    plate: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    brand: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    model: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    type: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    color: string;
}
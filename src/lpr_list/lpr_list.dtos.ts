import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsBooleanString } from 'class-validator';
import { ApiParam, ApiProperty, ApiPropertyOptional, ApiQuery, getSchemaPath, PartialType } from "@nestjs/swagger";

export class CreateLprListDto {
    @IsString()
    @ApiProperty()
    ocr: string;

    @IsString()
    @ApiProperty()
    vehiclebrand: string;

    @IsString()
    @ApiProperty()
    vehiclecolor: string;

    @IsString()
    @ApiProperty()
    vehiclemodel: string;

    @IsString()
    @ApiProperty()
    vehicletype: string;

    @IsString()
    @ApiProperty()
    drivername: string;

    @IsString()
    @ApiProperty()
    driverfamily: string;

    @IsString()
    @ApiProperty()
    driverphone: string;

    @IsString()
    @ApiProperty()
    driverdesc: string;

    @IsString()
    @ApiProperty()
    alarmText: string;

    @IsString()
    @ApiProperty()
    alarmColor: string;

    @IsBoolean()
    @ApiProperty()
    isBlackList: boolean;

    @IsBoolean()
    @ApiProperty()
    isWhiteList: boolean;

    @IsBoolean()
    @ApiProperty()
    isPartial: boolean;

    @IsBoolean()
    @ApiProperty()
    isNotifable: boolean;
}
export class UpdateLprListDto extends PartialType(CreateLprListDto) {}

export class searchLprListDto {
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

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty({ default: '', required: false })
    @IsOptional()
    @IsString()
    family: string;

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
    isPartial: string;

    @IsBooleanString()
    @IsOptional()
    @ApiPropertyOptional()
    isNotifable: string;
}


export class CreateLprListImageDto {
    @IsString()
    @ApiProperty()
    image: string;
}
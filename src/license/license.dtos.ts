import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsNotEmpty, IsArray, ValidateNested, IsObject } from 'class-validator';
import { ApiParam, ApiProperty, ApiQuery, getSchemaPath } from "@nestjs/swagger";
import { Type } from 'class-transformer';

// POST /license - Verify and store license
export class licensePostDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'License key string (base64url encoded)' })
  licenseKey: string;
}

// POST /license/generate - Generate new license
export class licenseGenerateDto {
  @ApiProperty({ description: 'Challenge JSON from client (GET /license/code)' })
  @IsObject()
  @IsNotEmpty()
  challenge: any;

  @ApiProperty({ description: 'Ed25519 public key (PEM format)', required: false })
  @IsString()
  @IsOptional()
  publicKey?: string;

  @ApiProperty({ description: 'Ed25519 private key (PEM format)', required: false })
  @IsString()
  @IsOptional()
  privateKey?: string;

  @ApiProperty({ description: 'Override payload name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Override payload organization', required: false })
  @IsString()
  @IsOptional()
  org?: string;

  @ApiProperty({ description: 'Override expiry date (ISO format)', required: false })
  @IsString()
  @IsOptional()
  expire?: string;

  @ApiProperty({ description: 'Number of cameras that can be added to system', required: false })
  @IsNumber()
  @IsOptional()
  camera?: number;

  @ApiProperty({ description: 'If recorder_service is available', required: false })
  @IsBoolean()
  @IsOptional()
  recorder?: boolean;

  @ApiProperty({ description: 'If lpr_service is available', required: false })
  @IsBoolean()
  @IsOptional()
  lpr?: boolean;

  @ApiProperty({ description: 'Max simultaneous active (running) recorders; creation of recorder configs is unlimited when recorder is enabled', required: false })
  @IsNumber()
  @IsOptional()
  recorder_count?: number;

  @ApiProperty({ description: 'Max simultaneous active (running) LPRs; creation of LPR configs is unlimited when lpr is enabled', required: false })
  @IsNumber()
  @IsOptional()
  lpr_count?: number;
}
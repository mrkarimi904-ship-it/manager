import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class webhookEndpointCreateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: "JSON string array of event keys", example: "[\"lpr.blacklist_detected\"]" })
  @IsString()
  @IsNotEmpty()
  event_keys: string;

  @ApiProperty({ example: "POST", description: "GET|POST|PUT" })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ description: "Bearer token without 'Bearer ' prefix" })
  @IsString()
  @IsOptional()
  bearer_token?: string;

  @ApiProperty({ description: "JSON body template string with {{placeholders}}", example: "{\"ocr\":\"{{payload.ocr}}\"}" })
  @IsString()
  @IsNotEmpty()
  body_template: string;

  @ApiPropertyOptional({ default: 5000, minimum: 500, maximum: 60000 })
  @IsInt()
  @Min(500)
  @Max(60000)
  @IsOptional()
  timeout_ms?: number;
}

export class webhookEndpointUpdateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ description: "JSON string array of event keys", example: "[\"lpr.blacklist_detected\"]" })
  @IsString()
  @IsOptional()
  event_keys?: string;

  @ApiPropertyOptional({ example: "POST", description: "GET|POST|PUT" })
  @IsString()
  @IsOptional()
  method?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: "Bearer token without 'Bearer ' prefix" })
  @IsString()
  @IsOptional()
  bearer_token?: string;

  @ApiPropertyOptional({ description: "JSON body template string with {{placeholders}}" })
  @IsString()
  @IsOptional()
  body_template?: string;

  @ApiPropertyOptional({ minimum: 500, maximum: 60000 })
  @IsInt()
  @Min(500)
  @Max(60000)
  @IsOptional()
  timeout_ms?: number;
}

export class webhookEndpointTestDto {
  @ApiPropertyOptional({ description: "Override event key for test", example: "lpr.blacklist_detected" })
  @IsString()
  @IsOptional()
  event_key?: string;

  @ApiPropertyOptional({ description: "Override payload object for test" })
  @IsOptional()
  payload?: any;
}


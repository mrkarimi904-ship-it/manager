import { IsString, IsEnum, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

enum enum_entrance_types {
  add,
  remove
}

export class assignDto {
  @ApiProperty({ example: '[""]', description: "from ID's" })
  @IsArray()
  @IsString({ each: true })  // "each" tells class-validator to run the validation on each item of the array
  @ArrayMinSize(1)
  from: string[];

  @ApiProperty({ example: '[""]', description: "to ID's" })
  @IsArray()
  @IsString({ each: true })  // "each" tells class-validator to run the validation on each item of the array
  @ArrayMinSize(1)
  to: string[];

  @ApiProperty({ example: "add", description: "add / remove" })
  @IsEnum(enum_entrance_types)
  action: string;
}

export class assignToAllDto {
  @ApiProperty({ example: '[""]', description: "to ID's" })
  @IsArray()
  @IsString({ each: true })  // "each" tells class-validator to run the validation on each item of the array
  @ArrayMinSize(1)
  from: string[];

  @ApiProperty({ example: "add", description: "add / remove" })
  @IsEnum(enum_entrance_types)
  action: string;
}

export class assignFromAllDto {
  @ApiProperty({ example: '[""]', description: "to ID's" })
  @IsArray()
  @IsString({ each: true })  // "each" tells class-validator to run the validation on each item of the array
  @ArrayMinSize(1)
  to: string[];

  @ApiProperty({ example: "add", description: "add / remove" })
  @IsEnum(enum_entrance_types)
  action: string;
}
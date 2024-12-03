import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber } from 'class-validator';

export class passwordComplexityDto {
  @ApiProperty()
  @IsNumber()
  minimumCharactersCount: number = 8;

  @ApiProperty()
  @IsBoolean()
  haveSpecialCharacters: boolean = false;

  @ApiProperty()
  @IsBoolean()
  haveUppercaseCharacters: boolean = false;

  @ApiProperty()
  @IsBoolean()
  haveLowercaseCharacters: boolean = false;

  @ApiProperty()
  @IsBoolean()
  haveDigits: boolean = false;
}
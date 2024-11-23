import { IsString, IsNotEmpty, MinLength, IsBoolean, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class signUpDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @ApiProperty()
  @IsBoolean()
  expired: boolean = false;

  @ApiProperty()
  @IsInt()
  expireInterval: number = 30;

  @ApiProperty()
  @IsBoolean()
  mustchangepassword: boolean = false;

  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsBoolean()
  isSuperAdmin: boolean = false;
}

export class singInDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}

export class editDto {
  @IsOptional()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  expired: boolean = false;

  @IsOptional()
  @ApiProperty()
  @IsInt()
  expireInterval: number = 30;

  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  mustchangepassword: boolean = false;

  @IsOptional()
  @ApiProperty()
  @IsString()
  firstname: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  lastname: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  description: string;

  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  isSuperAdmin: boolean = false;
}
import { IsString, IsNotEmpty, MinLength, IsBoolean, IsInt } from 'class-validator';
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

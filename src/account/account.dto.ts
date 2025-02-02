import { IsString, IsNotEmpty, MinLength, IsBoolean, IsInt, IsOptional, IsNumber, IsAlphanumeric, NotContains, Matches, Min } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class signUpDto {
  @ApiProperty()
  @IsString()
  @IsAlphanumeric('en-US')
  @NotContains(' ')
  @Matches(/^[a-zA-Z]/)
  @MinLength(4)
  @IsNotEmpty()
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
  @IsNotEmpty()
  firstname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
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
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  service: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ip: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  mac: string;
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
  @IsNotEmpty()
  firstname: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  description: string;

  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  isSuperAdmin: boolean = false;

  @IsOptional()
  @ApiProperty()
  @IsBoolean()
  isActive: boolean = false;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  concurrent: number = 1;
}

export class PasswordDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  old_password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  new_password: string;
}

export class accountSearchQuery {
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
  cameraId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  cameraFilter: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  userGroupId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  userGroupFilter: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  cameraGroupId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  cameraGroupFilter: string;

  @ApiProperty({ default: 'false', required: false })
  @IsOptional()
  @IsString()
  standardOnly: string;
}

export class roleSearchQuery {
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
  userId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  userFilter: string;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  @IsString()
  userGroupId: string;

  @ApiProperty({ default: 'Exclude', required: false })
  @IsOptional()
  @IsString()
  userGroupFilter: string;

}
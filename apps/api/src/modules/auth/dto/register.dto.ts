import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Role } from '@vendorconnect/shared';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'password must contain at least one letter and one number',
  })
  password!: string;

  @ApiPropertyOptional({ enum: [Role.COUPLE, Role.VENDOR], default: Role.COUPLE })
  @IsOptional()
  @IsEnum([Role.COUPLE, Role.VENDOR], { message: 'role must be COUPLE or VENDOR' })
  role?: Role.COUPLE | Role.VENDOR;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

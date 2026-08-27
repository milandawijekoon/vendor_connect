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

  @ApiPropertyOptional({ enum: [Role.CUSTOMER, Role.VENDOR], default: Role.CUSTOMER })
  @IsOptional()
  @IsEnum([Role.CUSTOMER, Role.VENDOR], { message: 'role must be CUSTOMER or VENDOR' })
  role?: Role.CUSTOMER | Role.VENDOR;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;
}

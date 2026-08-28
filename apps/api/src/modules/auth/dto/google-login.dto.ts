import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@vendorconnect/shared';

export class GoogleLoginDto {
  @ApiProperty({
    description:
      'The Google ID token (a JWT) returned by Google Identity Services on the client after the user picks an account.',
  })
  @IsString()
  @IsNotEmpty()
  idToken!: string;

  @ApiPropertyOptional({
    enum: [Role.CUSTOMER, Role.VENDOR],
    default: Role.CUSTOMER,
    description: 'Role to assign when this Google account signs in for the first time. Ignored for existing users.',
  })
  @IsOptional()
  @IsEnum([Role.CUSTOMER, Role.VENDOR], { message: 'role must be CUSTOMER or VENDOR' })
  role?: Role.CUSTOMER | Role.VENDOR;
}

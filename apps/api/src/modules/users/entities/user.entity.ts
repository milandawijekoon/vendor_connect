import { ApiProperty } from '@nestjs/swagger';
import type { Role } from '@vendorconnect/shared';

export class UserEntity {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() name!: string;
  @ApiProperty() role!: Role;
  @ApiProperty({ nullable: true }) phone!: string | null;
  @ApiProperty() createdAt!: Date;
}

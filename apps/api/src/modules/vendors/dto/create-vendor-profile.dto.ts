import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVendorProfileDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  businessName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(20)
  description!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  city!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  priceMax?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Public Facebook page URL' })
  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @ApiPropertyOptional({ description: 'Google Business / Maps listing URL' })
  @IsOptional()
  @IsUrl()
  googleUrl?: string;
}

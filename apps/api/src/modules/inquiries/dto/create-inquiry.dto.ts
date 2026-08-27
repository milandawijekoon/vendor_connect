import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateInquiryDto {
  @ApiProperty({ example: 'Nimal Perera' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'nimal@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+94771234567' })
  @IsString()
  @MinLength(7)
  phone!: string;

  @ApiPropertyOptional({ example: '2027-03-15', description: 'ISO date string for the wedding / event' })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiProperty({ example: 'Hi, I am looking for a photographer for our wedding in March 2027.', minLength: 20 })
  @IsString()
  @MinLength(20)
  message!: string;
}

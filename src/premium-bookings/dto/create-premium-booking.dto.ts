import { ApiProperty } from '@nestjs/swagger';
import { TamilMonth } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePremiumBookingDto {
  @ApiProperty({ example: '123' })
  @IsNumber()
  @IsNotEmpty()
  registrationNo: number;

  @ApiProperty({ example: 'user1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'user1' })
  @IsString()
  @IsNotEmpty()
  devoteeName: string;

  @ApiProperty({ example: 'Avitam' })
  @IsString()
  @IsOptional()
  star: string;

  @ApiProperty({ example: 'Kumbam' })
  @IsString()
  @IsOptional()
  rasi: string;

  @ApiProperty({ example: 'Vishvamitra' })
  @IsString()
  @IsOptional()
  gothram: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  mobile: string;

  @ApiProperty({ example: '12-B, Appaswamy apartment, sholingnallur, Chennai' })
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @ApiProperty({ example: '1A, blue moon apartment, sholingnallur, Chennai' })
  @IsString()
  @IsOptional()
  addressLine2: string;

  @ApiProperty({ example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Tamilnadu' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'Chennai' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: '600116' })
  @IsNumberString()
  @IsNotEmpty()
  pinCode: string;

  @ApiProperty({ example: 'user1@gmaill.com' })
  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+91' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: 'userr' })
  @IsString()
  @IsNotEmpty()
  choiceOfDeity: string;

  @ApiProperty({ example: '12' })
  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  day: number;

  @ApiProperty({ example: '12' })
  @Min(1)
  @Max(12)
  @IsNumber()
  @IsOptional()
  englishMonth: number;

  @ApiProperty({ example: 'Chithrai' })
  @IsString()
  @IsEnum(TamilMonth)
  @IsOptional()
  tamilMonth: TamilMonth;

  @ApiProperty({ example: '2024-01-26T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  bookingDate: Date;

  @ApiProperty({ example: '12' })
  @IsNumber()
  @IsNotEmpty()
  rptNo: number;

  @ApiProperty({ example: 'Birthday' })
  @IsString()
  @IsNotEmpty()
  occasion: string;

  @ApiProperty({ example: '1200' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

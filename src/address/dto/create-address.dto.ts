// create-address.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { HOME, OFFICE, OTHERS } from 'src/const';

export class CreateAddressDto {
  @ApiProperty({ example: 'user1' })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({ example: 'Sipcot' })
  @IsString()
  @IsOptional()
  landmark: string;

  @ApiProperty({ enum: [HOME, OFFICE, OTHERS] })
  @IsIn([HOME, OFFICE, OTHERS], { message: 'Invalid value provided' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Home' })
  @IsString()
  @IsOptional()
  tag: string;
}

export class CreateAddres {
  @ApiProperty({ example: 'India' })
  @IsOptional()
  id: string;

  @ApiProperty({ example: 'user1' })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({ example: 'Sipcot' })
  @IsString()
  @IsOptional()
  landmark: string;

  @ApiProperty({ enum: [HOME, OFFICE, OTHERS] })
  @IsIn([HOME, OFFICE, OTHERS], { message: 'Invalid value provided' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Home' })
  @IsString()
  @IsOptional()
  tag: string;
}

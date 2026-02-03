// create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '9879879879' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(10)
  mobile: string;

  @ApiProperty({ example: 'user1' })
  @IsString()
  @IsOptional()
  name: string;

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

  @ApiProperty({ example: 'male' })
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty({ example: '18/08/1997' })
  @IsDateString()
  @IsOptional()
  dob: Date;

  @ApiProperty({ example: 'user1@gmaill.com' })
  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'image.com' })
  @IsString()
  @IsOptional()
  imageUrl: string;

  @ApiProperty({ example: '+91' })
  @IsString()
  @IsOptional()
  countryCode: string;
}

export class CreateCountryCodeDto {
  @ApiProperty({ example: '+91' })
  @IsNotEmpty()
  @IsString()
  countryCode: string;
}

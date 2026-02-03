import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { VARIABLE } from 'src/const';

export class UpdateDonationDto {
  @ApiProperty({ example: 'Donation-1' })
  @Optional()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Donation temple trust' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: VARIABLE,
  })
  @Optional()
  type: string;

  @ApiProperty({ example: 10 })
  @Optional()
  minAmount: number;

  @ApiProperty({ example: 100000 })
  @Optional()
  maxAmount: number;

  @ApiProperty({ example: 'INR' })
  @Optional()
  @IsString()
  currency: string;

  @ApiProperty({ example: 'Special Instruction' })
  @IsOptional()
  @IsString()
  note: string;
}

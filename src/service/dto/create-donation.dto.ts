import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FIXED, VARIABLE } from 'src/const';

export class CreateDonationDto {
  @ApiProperty({ example: 'clnbhcoio001jvjgolbmapme0' })
  @IsNotEmpty()
  @IsString()
  serviceTypeId: string;

  @ApiProperty({ example: 'Temple-1' })
  @IsNotEmpty()
  @IsString()
  templeId: string;

  @ApiProperty({ example: 'Donation-1' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Donation temple trust' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: VARIABLE,
  })
  @IsNotEmpty()
  @IsIn([FIXED, VARIABLE])
  type: string;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  minAmount: number;

  @ApiProperty({ example: 100000 })
  @IsNotEmpty()
  maxAmount: number;

  @ApiProperty({ example: 'INR' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ example: 'Special Instruction' })
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({
    description: 'attachements',
    type: 'array',
    items: {
      type: 'file',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  @IsOptional()
  attachments: string[];
}

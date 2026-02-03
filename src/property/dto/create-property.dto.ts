import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RentalInfoCreateInput {
  @ApiProperty({ example: 'user name' })
  @IsOptional()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'address' })
  @IsOptional()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'chennai' })
  @IsOptional()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'tamilnadu' })
  @IsOptional()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '602789' })
  @IsOptional()
  @IsNotEmpty()
  pincode: string;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @IsNotEmpty()
  noOfDays: number;

  @ApiProperty({ example: '2024-02-05T07:21:26.023Z' })
  @IsOptional()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-02-05T07:21:26.023Z' })
  @IsOptional()
  @IsNotEmpty()
  endDate: string;
}
export class CreatePropertyDto {
  @ApiProperty({ example: 'property name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'description' })
  @IsOptional()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 100 })
  @IsOptional()
  @IsNotEmpty()
  fees: number;

  @ApiProperty({ type: RentalInfoCreateInput })
  @Type(() => RentalInfoCreateInput)
  @IsOptional()
  @IsNotEmpty()
  rental: RentalInfoCreateInput;

  @ApiProperty({ example: 'address' })
  @IsOptional()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'chennai' })
  @IsOptional()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Tamilnadu' })
  @IsOptional()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '602789' })
  @IsOptional()
  @IsNotEmpty()
  pincode: string;
}

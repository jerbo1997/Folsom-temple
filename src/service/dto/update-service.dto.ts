import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { JsonValue } from '@prisma/client/runtime/library';
import { Transform } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import {
  CUSTOM_DATES_PICKER,
  DAILY,
  DATES_RANGE,
  EVERY_FRIDAY,
  EVERY_MONDAY,
  EVERY_THURSDAY,
  EVERY_TUESDAY,
  EVERY_WEDNESDAY,
  MONTHLY_DATES,
  MONTHLY_DAYS,
  OCCURENCE_CONST,
  WEEKLY,
} from 'src/const';
import { IsCurrentMinDate } from 'src/utils/custom-validators/IsCurrentMinDate';

/*export class UpdateServiceDto {
  @ApiProperty({ example: 'Vilakku Pooja' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ example: 'Vilakku Pooja often occur during friday' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: { evening: '13:00', morning: '4:00' } })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) {
      return null;
    } else if (!(value?.morning >= '00:00' && value?.morning < '12:00')) {
      throw new BadRequestException(`invalid Morning input`);
    } else if (!(value?.evening >= '12:00' && value?.evening <= '23:59')) {
      throw new BadRequestException(`invalid Evening input`);
    } else {
      return value;
    }
  })
  time: JsonValue;

  @ApiProperty({ example: [DAILY, WEEKLY, MONTHLY, SPECIAL, PERIODIC] })
  @IsOptional()
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  occurence: string[];

  @ApiProperty({ example: 'timing' })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  timing: string;

  @ApiProperty({
    example: {
      summer: { evening: '13:00', morning: '4:00' },
      winter: { evening: '13:00', morning: '4:00' },
    },
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) {
      return null;
    } else if (
      !(value?.summer?.morning >= '00:00' && value?.summer?.morning <= '12:00')
    ) {
      throw new BadRequestException(`Invalid summer Morning input`);
    } else if (
      !(value?.summer?.evening >= '12:00' && value?.summer?.evening <= '23:59')
    ) {
      throw new BadRequestException(`Invalid summer evening input`);
    } else if (
      !(value?.winter?.morning >= '00:00' && value?.winter?.morning <= '12:00')
    ) {
      throw new BadRequestException(`Invalid winter Morning input`);
    } else if (
      !(value?.winter?.evening >= '12:00' && value?.winter?.evening <= '23:59')
    ) {
      throw new BadRequestException(`Invalid winter evening input`);
    } else {
      return value;
    }
  })
  season: JsonValue;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  prebookCutOff: number;

  @ApiProperty({ example: 100 })
  @IsOptional()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'INR' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ example: 'fullmoon day' })
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({
    example: ['2023-12-17T07:52:08.586Z', '2023-12-17T07:52:08.586Z'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @IsCurrentMinDate({ message: 'Invalid  date provided' })
  dates: string[];

  @ApiProperty({
    example: [
      EVERY_MONDAY,
      EVERY_TUESDAY,
      EVERY_WEDNESDAY,
      EVERY_THURSDAY,
      EVERY_FRIDAY,
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  weeklyOccurance: string[];

  @ApiProperty({
    example: [MONTHLY_1ST_SUNDAY, MONTHLY_2ND_SUNDAY, MONTHLY_3RD_SUNDAY],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  monthlyOccurance: string[];
}
*/
export class UpdateServiceInput {
  @ApiProperty({ example: 'Vilakku Pooja' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Vilakku Pooja often occur during friday' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: { evening: '13:00', morning: '04:00' } })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) {
      return null;
    } else if (!(value?.morning >= '00:00' && value?.morning < '12:00')) {
      throw new BadRequestException(`invalid Morning input`);
    } else if (!(value?.evening >= '12:00' && value?.evening <= '23:59')) {
      throw new BadRequestException(`invalid Evening input`);
    } else {
      return value;
    }
  })
  time: JsonValue;

  @ApiProperty({
    example: [
      DAILY,
      WEEKLY,
      MONTHLY_DAYS,
      MONTHLY_DATES,
      DATES_RANGE,
      CUSTOM_DATES_PICKER,
    ],
  })
  @IsIn(
    [
      DAILY,
      WEEKLY,
      MONTHLY_DAYS,
      MONTHLY_DATES,
      DATES_RANGE,
      CUSTOM_DATES_PICKER,
    ],
    {
      each: true,
    },
  )
  @ArrayMaxSize(1)
  @IsArray()
  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  occurenceType: string[];

  @ApiProperty({
    example: [
      EVERY_MONDAY,
      EVERY_TUESDAY,
      EVERY_WEDNESDAY,
      EVERY_THURSDAY,
      EVERY_FRIDAY,
    ],
  })
  @IsIn(OCCURENCE_CONST, { each: true })
  @IsArray()
  @IsOptional()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  occurence: string[];

  @ApiProperty({ example: 'timing' })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  timing: string;

  @ApiProperty({
    example: {
      summer: { evening: '13:00', morning: '04:00' },
      winter: { evening: '13:00', morning: '04:00' },
    },
  })
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null) {
      return null;
    } else if (
      !(value?.summer?.morning >= '00:00' && value?.summer?.morning <= '12:00')
    ) {
      throw new BadRequestException(`Invalid summer Morning input`);
    } else if (
      !(value?.summer?.evening >= '12:00' && value?.summer?.evening <= '23:59')
    ) {
      throw new BadRequestException(`Invalid summer evening input`);
    } else if (
      !(value?.winter?.morning >= '00:00' && value?.winter?.morning <= '12:00')
    ) {
      throw new BadRequestException(`Invalid winter Morning input`);
    } else if (
      !(value?.winter?.evening >= '12:00' && value?.winter?.evening <= '23:59')
    ) {
      throw new BadRequestException(`Invalid winter evening input`);
    } else {
      return value;
    }
  })
  season: JsonValue;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  prebookCutOff: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'INR' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ example: 'fullmoon day' })
  @IsOptional()
  @IsString()
  note: string;

  @ApiProperty({
    example: ['2023-12-17T07:52:08.586Z', '2023-12-17T07:52:08.586Z'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @IsCurrentMinDate({ message: 'Invalid  date provided' })
  dates: string[];

  @ApiProperty({
    example: { maxAmount: '100', minAmount: '100', isEditable: 'false | true' },
  })
  @IsOptional()
  config: JsonValue;

  @ApiProperty({
    example: true,
  })
  @IsOptional()
  isActive: boolean;
}

export class ServiceEnableOrDisableInput {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  isActive: boolean;
}

import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
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

export class CreateServiceDto {
  @ApiProperty({ example: 'clnbhcoio001jvjgolbmapme0' })
  @IsNotEmpty()
  @IsString()
  serviceTypeId: string;

  @ApiProperty({ example: 'Temple-1' })
  @IsNotEmpty()
  @IsString()
  templeId: string;

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
      CUSTOM_DATES_PICKER,
      DATES_RANGE,
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
  @Min(0)
  @Max(30)
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
}

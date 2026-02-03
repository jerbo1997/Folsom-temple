import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ example: 'ASXDCFV12344545' })
  @IsString()
  @IsNotEmpty()
  serviceCalendarId: string;

  @ApiProperty({ enum: [1, 0, -1] })
  @IsIn([1, 0, -1])
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 'any' })
  @IsString()
  @IsOptional()
  specialInstruction: string;

  @ApiProperty({ example: ['jhftedrxcfytuyuq1'] })
  @IsOptional()
  @IsArray()
  devotees: string[];
}

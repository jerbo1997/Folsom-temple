import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePropertyDto } from './create-property.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { RentalStatus } from '@prisma/client';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @ApiProperty({ example: 'remark' })
  @IsOptional()
  @IsNotEmpty()
  remarks: string;

  @ApiProperty({ example: 'status' })
  @IsOptional()
  @IsNotEmpty()
  status: RentalStatus;
}

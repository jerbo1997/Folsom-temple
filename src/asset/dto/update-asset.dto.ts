import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateAssetDto {
  @ApiProperty({ example: 'asset title' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'asset type' })
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'asset description' })
  @IsOptional()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'asset value' })
  @IsOptional()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNotEmpty()
  quantity: number;
}

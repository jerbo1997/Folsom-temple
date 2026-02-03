import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssetDto {
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

  @ApiProperty({ example: 'krish' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({ example: '+91' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: 'Avitam' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  star: string;

  @ApiProperty({ example: 'Kumbam' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  rasi: string;

  @ApiProperty({ example: 'Vishvamitra' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  gothram: string;
}

export class FilesDto {
  @ApiProperty({
    description: 'files',
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
  files: string[];
}

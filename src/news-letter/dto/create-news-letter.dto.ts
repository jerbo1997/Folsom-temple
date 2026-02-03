import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNewsLetterDto {
  @ApiProperty({ example: 'News' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Today News ',
  })
  @IsNotEmpty()
  description: string;

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

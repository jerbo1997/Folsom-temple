import { ApiProperty } from '@nestjs/swagger';
import {  IsOptional } from 'class-validator';

export class UpdateDeityDto {
    @ApiProperty({ example: 'clnd1jika0002vjv05vda6sk9', required: false })
    @IsOptional()
    title: string

    @ApiProperty({ example: 'clnd1jika0002vjv05vda6sk9', required: false })
    @IsOptional()
    description: string;

    @ApiProperty({ example: 'clnd1jika0002vjv05vda6sk9', required: false })
    @IsOptional()
    detail: string;

    @ApiProperty({ example: ['clnd1jika0002vjv05vda6sk9'], type: 'array', items: { type: 'string' }, required: false })
    @IsOptional()
    specialName: string[]

    @ApiProperty({ example: ['clnd1jika0002vjv05vda6sk9'], type: 'array', items: { type: 'string' }, required: false })
    @IsOptional()
    tag: string[]

    @ApiProperty({
        description: 'files',
        type: 'array',
        items: {
            type: 'file',
            items: {
                type: 'string',
                format: 'binary',
            }
        },
        required: false
    })
    @IsOptional()
    imageUrl: any[]
}

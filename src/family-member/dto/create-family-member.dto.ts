import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFamilyMemberDto {
  @ApiProperty({ example: 'user1' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 'Avitam' })
  @IsString()
  @IsOptional()
  star: string;

  @ApiProperty({ example: 'Kumbam' })
  @IsString()
  @IsOptional()
  rasi: string;
}

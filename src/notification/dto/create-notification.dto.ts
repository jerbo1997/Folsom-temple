import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ROLE_GUEST, ROLE_USER } from 'src/const';

export class CreateNotificationDto {
  @ApiProperty({ example: 'full moon pooja' })
  @IsOptional()
  title: string;

  @ApiProperty({
    example: 'tomorrow we conduct pooja for fullMoon special pooja ',
  })
  @IsOptional()
  description: string;

  @ApiProperty({ example: 'Guest or User' })
  @IsIn([ROLE_GUEST, ROLE_USER])
  @IsOptional()
  role: string;
}

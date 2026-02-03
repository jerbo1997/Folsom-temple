import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({ example: 'qwertyuiopjkljkl889j'})
  @IsOptional()
  id: string | null;
}

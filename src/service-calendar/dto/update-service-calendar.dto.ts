import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceCalendarDto {
  @ApiProperty({
    example: ['clozc7vik0000u3d4ezl1iz91', 'clozc7vik0000u3d4ezl1iz91'],
  })
  calendarIds: string[];

  @ApiProperty({ example: 'true' })
  isAvailable: boolean;
}

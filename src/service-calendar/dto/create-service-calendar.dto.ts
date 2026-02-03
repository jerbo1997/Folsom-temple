import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceCalendarDto {
  @ApiProperty({example:['sdfghj']})
  date: string[];
}

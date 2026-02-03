import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';
import { Exclude, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { EVERY_MONDAY, WEEKLY } from 'src/const';
import { ServiceCalendar } from 'src/service-calendar/service-calendar.model';

export class Service {
  constructor(data: Partial<Service>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'Krish' })
  title: string;

  @ApiProperty({ example: 123.44 })
  price: number;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiProperty({ example: 'Temple pooja' })
  description: string;

  @ApiProperty({ example: 'Temple pooja' })
  note: string;

  @ApiProperty({
    example: '{ maxAmount: 1500000, minAmount: 10, isEditable: true }',
  })
  config: JsonValue;

  @ApiProperty({ type: [ServiceCalendar] })
  @ValidateNested()
  @Type(() => ServiceCalendar)
  serviceCalendars?: ServiceCalendar[];

  @ApiProperty({ example: [EVERY_MONDAY] })
  occurenceType: any;

  @ApiProperty({ example: [WEEKLY] })
  occurence: any;

  @ApiProperty({ example: 10 })
  prebookCutOff: number;

  @ApiProperty({
    example: ['2023-12-17T07:52:08.586Z', '2023-12-17T07:52:08.586Z'],
  })
  dates: any;

  @Exclude()
  timing: string;

  @Exclude()
  time: any;

  @Exclude()
  season: any;

  @Exclude()
  serviceTypeId: string;

  @Exclude()
  templeId: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

export class Services {
  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'Krish' })
  title: string;

  @ApiProperty({ example: 'Temple pooja' })
  description: string;

  @ApiProperty({ example: 'Temple pooja' })
  note: string;

  @ApiProperty({ example: [EVERY_MONDAY] })
  occurenceType: any;

  @ApiProperty({ example: [WEEKLY] })
  occurence: any;

  @ApiProperty({ example: 'http://serviceType/image.jpg', required: false })
  imageUrl: string;

  @ApiProperty({
    example: ['2023-12-17T07:52:08.586Z', '2023-12-17T07:52:08.586Z'],
  })
  dates: any;

  @Exclude()
  time: JsonValue;

  @Exclude()
  season: JsonValue;

  @Exclude()
  timing: string;

  @ApiProperty({ example: 123.44 })
  price: number;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiProperty({
    example: { minAmount: '100', maxAmount: '100', isEditable: true },
  })
  config: JsonValue;

  @ApiProperty({ example: 12 })
  prebookCutOff: number;

  @Exclude()
  serviceTypeId: string;

  @Exclude()
  templeId: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @ApiProperty()
  attachments: string[];

  constructor(data: Partial<Services>) {
    Object.assign(this, data);
  }
}

export class DonationService {
  constructor(data: Partial<DonationService>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'Krish' })
  title: string;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiProperty({ example: 'Temple pooja' })
  description: string;

  @ApiProperty({ example: 'Temple pooja' })
  note: string;

  @ApiProperty({
    example: { maxAmount: '100', minAmount: '100', isEditable: 'false | true' },
  })
  config: any;

  @ApiProperty({ example: 'http://localhost:3000/image' })
  attachments: any;

  @Exclude()
  price: number;

  @Exclude()
  serviceCalendars?: ServiceCalendar[];

  @Exclude()
  occurence: any;

  @Exclude()
  timing: string;

  @Exclude()
  time: any;

  @Exclude()
  season: any;

  @Exclude()
  serviceTypeId: string;

  @Exclude()
  templeId: string;

  @Exclude()
  prebookCutOff: number;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

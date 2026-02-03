import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';

export class ServiceCalendar {
  constructor(data: Partial<ServiceCalendar>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: '2024-09-29T16:47:31.842Z' })
  date: string;

  // @ApiProperty({ type: Service })
  // @ValidateNested()
  // @Type(() => Service)
  // service?: Service;

  @Exclude()
  serviceId: boolean;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

export class ServiceCalendars {
  constructor(data: Partial<ServiceCalendars>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'Krish' })
  title: string;

  @ApiProperty({ example: 123.44 })
  price: number;

  @ApiProperty({ example: 'description' })
  description: string;

  @ApiProperty({ example: 'note' })
  note: string;

  @ApiProperty({ example: 'INR' })
  currency: string;

  @ApiProperty({ example: 'http://serviceType/image.jpg', required: false })
  imageUrl: string;

  @ApiProperty({ type: [ServiceCalendar], required: false })
  @Type(() => ServiceCalendar)
  serviceCalendars: ServiceCalendar[];

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

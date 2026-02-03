import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Services } from 'src/service/service.model';

export class ServiceType {
  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'asdfghjk' })
  type: string;

  @ApiProperty({ type: [Services] })
  @ValidateNested()
  @Type(() => Services)
  services?: Services[];

  @ApiProperty({ example: 'http://serviceType/image.jpg', required: false })
  imageUrl: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(data: Partial<ServiceType>) {
    Object.assign(this, data);
  }
}

export class GetAllServices {
  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'asdfghjk' })
  type: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(data: Partial<ServiceType>) {
    Object.assign(this, data);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { OCCURENCE_CONST } from 'src/const';
import { DonationService, Service } from 'src/service/service.model';

export class CreateServiceSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Service created successfully' })
  message: string;

  @ApiProperty({ type: Service })
  result: Service;

  @ApiProperty()
  isEncrypted: boolean;
}
export class ServiceSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Services Fetched successfully' })
  message: string;

  @ApiProperty({ type: [Service] })
  result: Service[];

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class ServiceSwaggerById {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Service Fetched successfully' })
  message: string;

  @ApiProperty({ type: Service })
  result: Service;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}
export class UpdateServiceSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Service updated successfully' })
  message: string;

  @ApiProperty({ type: Service })
  result: Service;

  @ApiProperty()
  isEncrypted: boolean;
}

export class DeleteServiceSwagger {
  @ApiProperty({ example: 200 })
  statusCode: string;

  @ApiProperty({ example: 'Service deleted successfully' })
  message: string;

  @ApiProperty({ example: null })
  result: any;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class OccurenceSwagger {
  @ApiProperty({ example: 200 })
  statusCode: string;

  @ApiProperty({ example: 'Occurences fetched successfuly' })
  message: string;

  @ApiProperty({ example: [OCCURENCE_CONST] })
  result: string[];

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class CreateDonationServiceSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Service created successfully' })
  message: string;

  @ApiProperty({ type: DonationService })
  result: DonationService;

  @ApiProperty()
  isEncrypted: boolean;
}

export class DeleteDonationServiceSwagger {
  @ApiProperty({ example: 200 })
  statusCode: string;

  @ApiProperty({ example: 'Donation Service deleted successfully' })
  message: string;

  @ApiProperty({ example: null })
  result: any;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class UpdateDonationServiceSwagger {
  @ApiProperty({ example: 200 })
  statusCode: string;

  @ApiProperty({ example: 'Donation Service updated successfully' })
  message: string;

  @ApiProperty({ type: DonationService })
  result: DonationService;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

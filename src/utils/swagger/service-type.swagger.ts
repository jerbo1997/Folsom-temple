import { ApiProperty } from '@nestjs/swagger';
import { GetAllServices, ServiceType } from 'src/service-type/service-type.model';

export class ServiceTypeSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Service-Types Fetched successfully' })
  message: string;

  @ApiProperty({ type: [ServiceType] })
  result: ServiceType[];

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class ServiceTypeSwaggerById {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Service-Type Fetched successfully' })
  message: string;

  @ApiProperty({ type: ServiceType })
  result: ServiceType;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class GetAllServiceTypeSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Service-Types Fetched successfully' })
  message: string;

  @ApiProperty({ type: [GetAllServices] })
  result: GetAllServices[];

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

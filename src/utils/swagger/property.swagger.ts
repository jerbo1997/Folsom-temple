import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from './base.swagger';
import { Property } from 'src/property/property.model';

export class PropertySwagger extends BaseResponse {
  @ApiProperty({ type: Property })
  result: Property;
}

export class AllPropertySwagger extends BaseResponse {
  @ApiProperty({ type: [Property] })
  result: Property[];
}

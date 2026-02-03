import { ApiProperty } from '@nestjs/swagger';
import { Address } from 'src/address/address.model';

export class CreateAddressSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'New address created successfully' })
  message: string;

  @ApiProperty({ type: Address })
  result: Address;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class AddressessSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Addresses Fetched successfully' })
  message: string;

  @ApiProperty({ type: [Address] })
  result: Address[];

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class AddressSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Address Fetched successfully' })
  message: string;

  @ApiProperty({ type: Address })
  result: Address;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class UpdatedAddressSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Address updated successfully' })
  message: string;

  @ApiProperty({ type: Address })
  result: Address;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class DeleteAddressSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Address deleted successfully' })
  message: string;

  @ApiProperty({ example: null })
  result: any;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

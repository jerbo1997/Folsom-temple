import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Something went wrong' })
  message: string;

  @ApiProperty({ example: 'Some error description' })
  error: string;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

import { ApiProperty } from '@nestjs/swagger';

export class BaseResponse {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Response message' })
  message: string;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

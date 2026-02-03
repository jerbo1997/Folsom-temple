import { ApiProperty } from '@nestjs/swagger';
import { MyUser, SyncUser, UpdateUser, User } from 'src/user/user.model';

export class UserSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'User Fetched successfully' })
  message: string;

  @ApiProperty({ type: MyUser })
  result: MyUser;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class UpdateUserSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'User updated successfully' })
  message: string;

  @ApiProperty({ type: UpdateUser })
  result: UpdateUser;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class syncUserSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'User synced successfully' })
  message: string;

  @ApiProperty({ type: SyncUser })
  result: SyncUser;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

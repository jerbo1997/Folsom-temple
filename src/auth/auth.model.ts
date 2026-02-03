import { ApiProperty } from '@nestjs/swagger';

export class Login {
  @ApiProperty({
    example:
      'UWbdlfsdf823rdpsfsidofhjs0dfisdjfs0d9fus0dfjsd0f9sdufsodjfsodf9iusd',
  })
  accessToken: string;

  @ApiProperty({ example: 'User or Admin' })
  role: string;

  @ApiProperty({ example: false })
  isUserUpdated: boolean;

  constructor(data: Partial<Login>) {
    Object.assign(this, data);
  }
}

export class AdminLogin {
  @ApiProperty({
    example:
      'UWbdlfsdf823rdpsfsidofhjs0dfisdjfs0d9fus0dfjsd0f9sdufsodjfsodf9iusd',
  })
  accessToken: string;

  constructor(data: Partial<AdminLogin>) {
    Object.assign(this, data);
  }
}

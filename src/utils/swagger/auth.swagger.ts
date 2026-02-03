import { ApiProperty } from '@nestjs/swagger';
import { AdminLogin, Login } from 'src/auth/auth.model';

export class LoginSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Token generated successfully' })
  message: string;

  @ApiProperty({ type: Login })
  result: Login;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class AdminLoginSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Logging successfully' })
  message: string;

  @ApiProperty({ type: AdminLogin })
  result: AdminLogin;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

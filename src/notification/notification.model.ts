import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from 'src/user/user.model';

export class Notification {
  constructor(data: Partial<Notification>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'New notification' })
  title: string;

  @ApiProperty({ example: 'new notification received' })
  description: string;

  @ApiProperty({ example: 'ertyui0001nevwa9ruv5o1' })
  targetId: String;

  @ApiProperty({ example: 'Order' })
  targetModule: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ type: User })
  user: User;

  @ApiProperty({ example: '2024-01-25T06:15:41.966Z' })
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

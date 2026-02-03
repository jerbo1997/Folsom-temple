import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { Attachment } from 'src/attachment.model';
import { User } from 'src/user/user.model';

export class Asset {
  constructor(data: Partial<Asset>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'f99b1ed0-1e17-4ce7-9f17-2483603c004e' })
  id: string;

  @ApiProperty({ example: 'asset title' })
  title: string;

  @ApiProperty({ example: 'asset type' })
  type: string;

  @ApiProperty({ example: 1 })
  quantity: number;

  @ApiProperty({ example: 'asset description' })
  description: string;

  @ApiProperty({ example: 'asset value' })
  value: string;

  @ApiProperty({ type: [Attachment] })
  @Type(() => Attachment)
  attachments: Attachment[];

  @ApiProperty({ type: User })
  @Type(() => User)
  createdBy: User;

  @ApiProperty({ type: User, required: false })
  @Type(() => User)
  donatedBy: User;

  @ApiProperty({ example: '2022-09-27T18:00:00.000Z' })
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  createdId: string;

  @Exclude()
  updatedId: string;

  @Exclude()
  templeId: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  donatedById: string;
}

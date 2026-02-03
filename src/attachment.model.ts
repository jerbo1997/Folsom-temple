import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class Attachment {
  constructor(data: Partial<Attachment>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'f99b1ed0-1e17-4ce7-9f17-2483603c004e' })
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'https://image.com/imagesrc.img' })
  @IsNotEmpty()
  url: string;

  @ApiProperty({ example: 'image/jpg' })
  @IsNotEmpty()
  mime: string;

  @Exclude()
  assetId: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  userId: string;
}

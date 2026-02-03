import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class FamilyMember {
  @ApiProperty({ example: 'UUID1234567890' })
  id!: string;

  @ApiProperty({ example: 'User name' })
  name?: string;

  @ApiProperty({ example: 'Avittam' })
  star?: string;

  @ApiProperty({ example: 'Kumbam' })
  rasi?: string;

  @Exclude()
  user: boolean;

  @Exclude()
  userId: boolean;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(data: Partial<FamilyMember>) {
    Object.assign(this, data);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Member } from 'src/member/member.model';

export class Group {
  constructor(data: Partial<Group>) {
    Object.assign(this, data);
  }

  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'commity members' })
  name: string;

  @ApiProperty({ type: [Member] })
  @ValidateNested()
  @Type(() => Member)
  member?: Member[];

  @Exclude()
  groupSort: number;

  @Exclude()
  isActive: boolean;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class NewsLetter {
  constructor(data: Partial<NewsLetter>) {
    Object.assign(this, data);
  }
  @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
  id: string;

  @ApiProperty({ example: 'News' })
  title: string;

  @ApiProperty({ example: 'Today news' })
  description: string;

  @ApiProperty({ example: ['Today news'] })
  files: string[];

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}

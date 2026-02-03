import { ApiProperty } from '@nestjs/swagger';
import { NewsLetter } from 'src/news-letter/news-letter.model';

export class CreateNewsLetterSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'News letter Created successfully' })
  message: string;

  @ApiProperty({ type: NewsLetter })
  result: NewsLetter;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class FetchNewsLetterSwagger {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'News letter fetched successfully' })
  message: string;

  @ApiProperty({ type: NewsLetter })
  result: NewsLetter;

  @ApiProperty({ example: false })
  isEncrypted: boolean;
}

export class UpdateNewsLetterSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;
  
    @ApiProperty({ example: 'News letter updated successfully' })
    message: string;
  
    @ApiProperty({ type: NewsLetter })
    result: NewsLetter;
  
    @ApiProperty({ example: false })
    isEncrypted: boolean;
  }

  export class DeleteNewsLetterSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;
  
    @ApiProperty({ example: 'News letter deleted successfully' })
    message: string;
  
    @ApiProperty({ type: NewsLetter })
    result: NewsLetter;
  
    @ApiProperty({ example: false })
    isEncrypted: boolean;
  }

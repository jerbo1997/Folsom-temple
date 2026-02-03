import { Module } from '@nestjs/common';
import { NewsLetterService } from './news-letter.service';
import { NewsLetterController } from './news-letter.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NewsLetterController],
  providers: [NewsLetterService],
})
export class NewsLetterModule {}

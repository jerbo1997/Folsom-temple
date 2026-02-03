import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsLetterDto } from './dto/create-news-letter.dto';
import { UpdateNewsLetterDto } from './dto/update-news-letter.dto';
import { User } from 'src/user/user.model';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { uploadFile, unlinkFile, fetchFiles } from 'src/utils/helperFunction';
import { NewsLetter } from './news-letter.model';
import { NEWS_LETTER } from 'src/const';

@Injectable()
export class NewsLetterService {
  constructor(private readonly prisma: PrismaService) { }
  async create(
    user: User,
    input: CreateNewsLetterDto,
    files: Express.Multer.File[],
  ) {
    const data: Prisma.NewsLetterCreateInput = {
      title: input.title,
      description: input.description,
      createdBy: { connect: { id: user.id } },
    };
    if (files) {
      const url = await uploadFile(files, NEWS_LETTER);
      data.files = url;
    }
    const news = await this.prisma.newsLetter.create({ data });
    if (news.files && news.files.length) {
      news.files = await fetchFiles(news.files)
    }
    return news;
  }

  async findAll() {
    const newsLetters = await this.prisma.newsLetter.findMany();
    newsLetters.forEach(async (it) => {
      if (it.files && it.files.length) { it.files = await fetchFiles(it.files) }
    })
    return newsLetters;
  }

  async findOne(id: string) {
    const newsLetter = await this.prisma.newsLetter.findUnique({
      where: { id },
    });
    if (!newsLetter) {
      throw new NotFoundException('News letter not found');
    }
    if (newsLetter.files && newsLetter.files.length) {
      newsLetter.files = await fetchFiles(newsLetter.files)
    }
    return newsLetter;
  }

  async update(
    id: string,
    input: UpdateNewsLetterDto,
    file: Express.Multer.File[],
  ) {
    const data: Prisma.NewsLetterUpdateInput = {
      title: input.title,
      description: input.description,
    };
    const newsLetter = await this.findOne(id);
    if (file.length) {
      if (newsLetter.files.length) {
        const currentFileUrls = newsLetter.files;
        for (const url of currentFileUrls) {
          const parts = url.split('newsLetter/');
          const filename = parts[parts.length - 1];
          const pathName = `newsLetter/${filename}`;
          const dirName = __dirname;
          unlinkFile(dirName, pathName);
        }
      }
      const newUrl = uploadFile(file, NEWS_LETTER);
      data.files = newUrl;
    }

    return await this.prisma.newsLetter.update({ where: { id }, data });
  }

  async remove(id: string, newsLetter: NewsLetter) {
    if (newsLetter.files.length) {
      const currentFileUrls = newsLetter.files;
      for (const url of currentFileUrls) {
        const parts = url.split('newsLetter/');
        const filename = parts[parts.length - 1];
        const pathName = `newsLetter/${filename}`;
        const dirName = __dirname;
        unlinkFile(dirName, pathName);
      }
    }
    return await this.prisma.newsLetter.delete({ where: { id } });
  }
}

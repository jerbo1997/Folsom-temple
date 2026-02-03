import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Put,
  BadRequestException,
  ClassSerializerInterceptor,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { NewsLetterService } from './news-letter.service';
import { CreateNewsLetterDto } from './dto/create-news-letter.dto';
import { UpdateNewsLetterDto } from './dto/update-news-letter.dto';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { User } from 'src/user/user.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'path';
import { NewsLetter } from './news-letter.model';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';
import {
  FetchNewsLetterSwagger,
  CreateNewsLetterSwagger,
  DeleteNewsLetterSwagger,
} from 'src/utils/swagger/newsLetter.swagger';
import { diskStorage } from 'multer';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  CREATE_NEWS_LETTER,
  DELETE_NEWS_LETTER,
  GET_ALL_NEWS_LETTER,
  GET_NEWS_LETTER,
  UPDATE_NEWS_LETTER,
} from 'src/auth/permissions.const';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('newsLetters')
@UseGuards(ApiAuthGuard, RolesGuard)
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@UseInterceptors(ClassSerializerInterceptor)
@Controller('news-letters')
@ApiBearerAuth()
export class NewsLetterController {
  constructor(
    private readonly newsLetterService: NewsLetterService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(CREATE_NEWS_LETTER)
  @Post()
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'create newsLetters' })
  @ApiOkResponse({ type: CreateNewsLetterSwagger })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: async (req, file, cb) =>
          cb(null, join('public', 'newsLetter')),
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  async create(
    @CurrentUser() user: User,
    @Body() createNewsLetterDto: CreateNewsLetterDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const newsLetter: any = await this.newsLetterService.create(
      user,
      createNewsLetterDto,
      files,
    );
    return {
      message: 'newsLetter created succussfully',
      result: new NewsLetter(newsLetter),
    };
  }

  @Permissions(GET_ALL_NEWS_LETTER)
  @Get()
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER,ROLE_GUEST] })
  @ApiOperation({ summary: 'Get all newsLetters ' })
  @ApiOkResponse({ type: FetchNewsLetterSwagger })
  async findAll() {
    const newsLetters: any = await this.newsLetterService.findAll();
    return {
      message: 'newsLetter created succussfully',
      result: newsLetters.map((it) => new NewsLetter(it)),
    };
  }

  @Permissions(GET_NEWS_LETTER)
  @Get(':id')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER,ROLE_GUEST] })
  @ApiOperation({ summary: 'Get News Letter by id' })
  @ApiOkResponse({ type: FetchNewsLetterSwagger })
  async findOne(@Param('id') id: string) {
    const newsLetter: any = await this.newsLetterService.findOne(id);
    return {
      message: 'newsLetter created succussfully',
      result: new NewsLetter(newsLetter),
    };
  }

  @Permissions(UPDATE_NEWS_LETTER)
  @Put(':id')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update News letter' })
  @ApiOkResponse({ type: CreateNewsLetterSwagger })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: async (req, file, cb) =>
          cb(null, join('public', 'newsLetter')),
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateNewsLetterDto: UpdateNewsLetterDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const news = await this.newsLetterService.findOne(id);
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (userData) {
      if (userData.id !== news.createdById) {
        throw new BadRequestException('User Access denied');
      }
    } else {
      throw new NotFoundException('User not found');
    }
    const newsLetter: any = await this.newsLetterService.update(
      id,
      updateNewsLetterDto,
      files,
    );
    return {
      message: 'newsLetter created succussfully',
      result: new NewsLetter(newsLetter),
    };
  }

  @Permissions(DELETE_NEWS_LETTER)
  @Delete('delete/:id')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Delete News letter' })
  @ApiOkResponse({ type: DeleteNewsLetterSwagger })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    const news = await this.newsLetterService.findOne(id);
    if (news.createdById !== user.id) {
      throw new BadRequestException('User access denied');
    }
    const newsLetter: any = await this.newsLetterService.remove(id, news);
    return {
      message: 'newsLetter deleted succussfully',
      result: new NewsLetter(newsLetter),
    };
  }
}

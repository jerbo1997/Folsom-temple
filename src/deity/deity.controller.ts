import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { DeityService } from './deity.service';
import { CreateDeityDto } from './dto/create-deity.dto';
import { UpdateDeityDto } from './dto/update-deity.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import { ErrorResponse } from 'src/utils/common/common.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  CREATE_DEITY,
  DELETE_DEITY,
  GET_ALL_DEITY,
  GET_DEITY,
  UPDATE_DEITY,
} from 'src/auth/permissions.const';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import {
  DeleteDeityswaggar,
  DietySwagger,
  FetchAllDeitySwagger,
  FetchDeitySwagger,
  UpdatedDeitySwagger,
} from 'src/utils/swagger/deity.swagger';
import { Deity } from './deity.model';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { User } from 'src/user/user.model';

@ApiTags('deities')
@UseGuards(ApiAuthGuard, RolesGuard)
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@UseInterceptors(ClassSerializerInterceptor)
@Controller('deities')
@ApiBearerAuth()
export class DeityController {
  constructor(
    private readonly deityService: DeityService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(CREATE_DEITY)
  @Post(':templeId')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'create Diety' })
  @ApiOkResponse({ type: DietySwagger })
  @UseInterceptors(
    FilesInterceptor('imageUrl', 5, {
      storage: diskStorage({
        destination: async (req, file, cb) => cb(null, join('public', 'deity')),
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  async create(
    @Param('templeId') templeId: string,
    @Body() input: CreateDeityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const deity = await this.deityService.create(templeId, input, files);
    return {
      message: 'Diety created succussfully',
      result: new Deity(deity),
    };
  }

  @Permissions(GET_ALL_DEITY)
  @Get()
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_GUEST, ROLE_USER] })
  @ApiOperation({ summary: 'get all deity' })
  @ApiOkResponse({ type: FetchAllDeitySwagger })
  async findAll() {
    const deity: any = await this.deityService.findAll();

    return {
      message: 'deity created successfully',
      result: deity.map((it) => new Deity(it)),
    };
  }
  @Permissions(GET_DEITY)
  @Get(':id')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
  @ApiOperation({ summary: 'get deity by id' })
  @ApiOkResponse({ type: FetchDeitySwagger })
  async findOne(@Param('id') id: string) {
    const deity: any = await this.deityService.findOne(id);

    return {
      message: 'deity created successfully',
      result: new Deity(deity),
    };
  }
  @Permissions(UPDATE_DEITY)
  @Put(':id')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update Deity' })
  @ApiOkResponse({ type: UpdatedDeitySwagger })
  @UseInterceptors(
    FilesInterceptor('imageUrl', 5, {
      storage: diskStorage({
        destination: async (req, file, cb) => cb(null, join('public', 'deity')),
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateDeityDto: UpdateDeityDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const deity = await this.deityService.update(id, updateDeityDto, files);

    return {
      message: 'deity updated successfully',
      result: new Deity(deity),
    };
  }

  @Permissions(DELETE_DEITY)
  @Delete(':id')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Delete Deity ' })
  @ApiOkResponse({ type: DeleteDeityswaggar })
  async remove(@Param('id') id: string, @CurrentUser() User: User) {
    const deity = await this.deityService.findOne(id);
    await this.deityService.remove(id, deity);
    return {
      message: 'deity deleted successfully',
    };
  }
}

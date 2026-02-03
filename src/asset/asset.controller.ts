import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto, FilesDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import {
  ADD_ASSET,
  DELETE_ASSET,
  GET_ALL_ASSET,
  GET_ASSET,
  UPDATE_ASSET,
  UPDATE_ASSET_ATTACHMENTS,
} from 'src/auth/permissions.const';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  AllAssetsSwagger,
  AssetSwagger,
} from 'src/utils/swagger/assets.swagger';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { User } from 'src/user/user.model';
import { Asset } from './asset.model';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { KB_500, ROLE_ADMIN } from 'src/const';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import {
  dateInputValidation,
  userInputValidation,
} from 'src/utils/helperFunction';

@ApiTags('assets')
@ApiBearerAuth()
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@UseInterceptors(ClassSerializerInterceptor)
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Permissions(ADD_ASSET)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Add a new asset' })
  @ApiOkResponse({ type: AssetSwagger })
  @ApiBody({ type: CreateAssetDto, required: false })
  @Post()
  async create(@Body() input: CreateAssetDto, @CurrentUser() user: User) {
    await userInputValidation(
      input.name || undefined,
      input.mobile || undefined,
      input.countryCode || undefined,
      input.star || undefined,
      input.rasi || undefined,
      input.gothram || undefined,
    );
    const data = await this.assetService.create(input, user);
    return {
      message: 'New asset created successfully',
      result: new Asset(data),
    };
  }

  @Permissions(GET_ALL_ASSET)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Get all assets' })
  @ApiOkResponse({ type: AllAssetsSwagger })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (startDate || endDate) {
      dateInputValidation(startDate || undefined, endDate || undefined);
    }
    let start: Date;
    let end: Date;
    if (startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }
    const data = await this.assetService.findAll(start, end);
    return {
      message: 'All assets fetched successfully',
      result: data.map((it) => new Asset(it)),
    };
  }

  @Permissions(GET_ASSET)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Get asset' })
  @ApiOkResponse({ type: AssetSwagger })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.assetService.findOne(id);
    if (!data) {
      throw new BadRequestException('Invalid request asset not found');
    }
    return { message: 'Assets fetched successfully', result: new Asset(data) };
  }

  @Permissions(UPDATE_ASSET)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Update asset' })
  @ApiOkResponse({ type: AssetSwagger })
  @Put(':id')
  async update(@Param('id') id: string, @Body() input: UpdateAssetDto) {
    const data = await this.assetService.findOne(id);
    if (!data) {
      throw new BadRequestException('Invalid request asset not found');
    }
    const result = await this.assetService.update(id, input);
    return {
      message: 'Asset updated successfully',
      result: new Asset(result),
    };
  }

  @Permissions(DELETE_ASSET)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Delete asset' })
  @ApiOkResponse({ type: AssetSwagger })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data: any = await this.assetService.findOne(id);
    if (!data) {
      throw new BadRequestException('Invalid request asset not found');
    }
    await this.assetService.remove(data);
    return { message: 'Asset removed successfully', result: new Asset(data) };
  }

  @Permissions(UPDATE_ASSET_ATTACHMENTS)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update Attachments' })
  @ApiOkResponse({ type: AssetSwagger })
  @ApiBody({ type: FilesDto })
  @UseInterceptors(
    FilesInterceptor('files', Number(process.env.MAX_FILES_COUNT), {
      limits: {
        fileSize: KB_500,
      },
      storage: diskStorage({
        destination: async (req, file, cb) =>
          cb(null, join('public', 'assets')),
        filename: (req, file, cb) => {
          return cb(
            null,
            `${Date.now()}.${file.originalname.split('.').slice(-1)}`,
          );
        },
      }),
    }),
  )
  @Put('files/:id')
  async filesUpload(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log(files, '<<<<<<<<<< file format');

    const data: any = await this.assetService.findOne(id);
    if (!data) {
      throw new BadRequestException('Invalid request asset not found');
    }
    const result = await this.assetService.filesUpload(id, files, data, user);
    return {
      message: 'Asset updated successfully',
      result: new Asset(result),
    };
  }
}

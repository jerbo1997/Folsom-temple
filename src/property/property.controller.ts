import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  ClassSerializerInterceptor,
  Put,
  UploadedFiles,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Permissions } from 'src/auth/permissions.decorator';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
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
import { KB_500, ROLE_ADMIN, ROLE_USER } from 'src/const';
import {
  AllPropertySwagger,
  PropertySwagger,
} from 'src/utils/swagger/property.swagger';
import {
  CREATE_PROPERTY,
  GET_ALL_PROPERTIES,
  GET_PROPERTY,
  UPDATE_PROPERTY,
} from 'src/auth/permissions.const';
import { Property, RentalStatusEnum } from './property.model';
import {
  addressInputValidation,
  dateInputValidation,
} from 'src/utils/helperFunction';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { User } from 'src/user/user.model';
import { ErrorResponse } from 'src/utils/common/common.model';
import { FilesDto } from 'src/asset/dto/create-asset.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { RentalStatus } from '@prisma/client';

@ApiTags('property')
@ApiBearerAuth()
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@UseInterceptors(ClassSerializerInterceptor)
@Controller('property')
@UseGuards(ApiAuthGuard, RolesGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}
  @Permissions(CREATE_PROPERTY)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Create a new property' })
  @ApiOkResponse({ type: PropertySwagger })
  @ApiBody({ type: CreatePropertyDto })
  @Post()
  async create(@Body() input: CreatePropertyDto, @CurrentUser() user: User) {
    if (input.rental?.startDate || input.rental?.endDate) {
      await dateInputValidation(
        input.rental.startDate || undefined,
        input.rental.endDate || undefined,
      );
    }
    if (
      (input.rental?.userName || input.rental?.phoneNumber) &&
      !(input.rental.userName && input.rental.phoneNumber)
    ) {
      throw new BadRequestException(
        'userName and phoneNumber should be required',
      );
    }
    if (input.rental?.address) {
      await addressInputValidation(
        input.rental.userName || undefined,
        input.rental.phoneNumber || undefined,
        input.rental.address || undefined,
        input.rental.city || undefined,
        input.rental.pincode || undefined,
      );
    }
    if (input.address) {
      if (!(input.address && input.city && input.pincode)) {
        throw new BadRequestException(
          'More user address details should be required',
        );
      }
    }
    const property = await this.propertyService.create(input, user);
    return {
      message: 'New property created successfully',
      result: new Property(property),
    };
  }

  @Permissions(GET_ALL_PROPERTIES)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'getAll properties' })
  @ApiOkResponse({ type: AllPropertySwagger })
  @Get()
  async findAll(@CurrentUser() user: User) {
    const property = await this.propertyService.findAll(user);
    return {
      message: 'All Properties fetched successfully',
      result: property.map((it) => new Property(it)),
    };
  }

  @Permissions(GET_PROPERTY)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'Get a property' })
  @ApiOkResponse({ type: PropertySwagger })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const property = await this.propertyService.findOne(id);
    return {
      message: 'Property fetched successfully',
      result: new Property(property),
    };
  }

  @Permissions(UPDATE_PROPERTY)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Update a property' })
  @ApiOkResponse({ type: PropertySwagger })
  @ApiBody({ type: UpdatePropertyDto })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePropertyDto,
    @CurrentUser() user: User,
  ) {
    const property = await this.findOne(id);
    if (input.rental?.startDate || input.rental?.endDate) {
      await dateInputValidation(
        input.rental.startDate || undefined,
        input.rental.endDate || undefined,
      );
    }
    if (
      (input.rental?.userName || input.rental?.phoneNumber) &&
      !(input.rental.userName && input.rental.phoneNumber)
    ) {
      throw new BadRequestException(
        'userName and phoneNumber should be required',
      );
    }
    if (input.rental?.address) {
      await addressInputValidation(
        input.rental.userName || undefined,
        input.rental.phoneNumber || undefined,
        input.rental.address || undefined,
        input.rental.city || undefined,
        input.rental.pincode || undefined,
      );
    }
    if (input.address) {
      if (!(input.address && input.city && input.pincode)) {
        throw new BadRequestException(
          'More user address details should be required',
        );
      }
    }
    const existingStatus = property.result.status;
    const inputStatus = RentalStatusEnum[input.status];
    if (input.remarks && ![RentalStatusEnum.RETURNED].includes(inputStatus)) {
      throw new BadRequestException(
        `Invalid input provided. RETURNED status should be required for remarks`,
      );
    }
    if (input.status) {
      if (
        inputStatus === existingStatus ||
        (existingStatus === RentalStatus.AVAILABLE &&
          ![
            RentalStatusEnum.RENTED_OUT,
            RentalStatusEnum.NOT_AVAILABLE,
          ].includes(inputStatus)) ||
        (existingStatus === RentalStatus.RENTED_OUT &&
          ![RentalStatusEnum.RETURNED].includes(inputStatus)) ||
        (existingStatus === RentalStatus.NOT_AVAILABLE &&
          ![RentalStatusEnum.AVAILABLE].includes(inputStatus))
      ) {
        throw new BadRequestException(
          `Invalid status update. current status is ${existingStatus}`,
        );
      }
    }
    if (
      inputStatus === RentalStatusEnum.RENTED_OUT &&
      !(input.rental.userName && input.rental.phoneNumber)
    ) {
      throw new BadRequestException(
        'Rental informations (userName and phoneNumber) should be required',
      );
    }
    if (
      property.result.status === RentalStatusEnum.RENTED_OUT &&
      (input.rental ||
        input.fees ||
        input.name ||
        input.description ||
        input.address)
    ) {
      throw new BadRequestException(
        `Can't able to update property. Current property status is ${property.result.status} `,
      );
    }
    const propertyData = await this.propertyService.update(
      id,
      input,
      user,
      property.result,
    );
    return {
      message: 'Property updated successfully',
      result: new Property(propertyData),
    };
  }

  @Permissions(UPDATE_PROPERTY)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update Attachments' })
  @ApiOkResponse({ type: PropertySwagger })
  @ApiBody({ type: FilesDto })
  @UseInterceptors(
    FilesInterceptor('files', Number(process.env.MAX_FILE_COUNT), {
      limits: {
        fileSize: KB_500,
      },
      storage: diskStorage({
        destination: async (req, file, cb) =>
          cb(null, join('public', 'properties')),
        filename: (req, file, cb) => {
          return cb(
            null,
            `${Date.now()}.${file.originalname.split('.').slice(-1)}`,
          );
        },
      }),
    }),
  )
  @Put('file/:id')
  async fileUpload(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    await this.propertyService.findOne(id);
    const result = await this.propertyService.fileUpload(id, files[0], user);
    return {
      message: 'Property updated successfully',
      result: new Property(result),
    };
  }
}

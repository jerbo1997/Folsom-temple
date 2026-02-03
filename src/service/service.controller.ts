import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import {
  CUSTOM_DATES_PICKER,
  DATES_RANGE,
  DONATION,
  FIXED,
  OCCURENCE_CONST,
  ROLE_ADMIN,
  ROLE_GUEST,
  ROLE_USER,
  VARIABLE,
} from 'src/const';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  CreateDonationServiceSwagger,
  CreateServiceSwagger,
  DeleteDonationServiceSwagger,
  DeleteServiceSwagger,
  OccurenceSwagger,
  ServiceSwaggerById,
  UpdateDonationServiceSwagger,
  UpdateServiceSwagger,
} from 'src/utils/swagger/service.swagger';
import { DonationService, Service } from './service.model';
import {
  CREATE_SERVICE,
  DELETE_SERVICE,
  GET_OCCURENCE,
  GET_SERVICE,
  UPDATE_SERVICE,
} from 'src/auth/permissions.const';
import { CreateServiceDto } from './dto/create-service.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ServiceEnableOrDisableInput,
  UpdateServiceInput,
} from './dto/update-service.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { Prisma } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@ApiTags('service')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('service')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(CREATE_SERVICE)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @Post()
  @ApiOkResponse({
    type: CreateServiceSwagger,
  })
  async create(@Body() createServiceDto: CreateServiceDto) {
    const serviceType = await this.prisma.serviceType.findUnique({
      where: { id: createServiceDto.serviceTypeId },
    });
    if (!serviceType || (serviceType && serviceType.type === DONATION)) {
      throw new NotFoundException(`ServiceType not found`);
    }
    const temple = await this.prisma.temple.findUnique({
      where: { templeId: createServiceDto.templeId },
    });
    if (!temple) {
      throw new NotFoundException(`Temple not found`);
    }
    if (
      (createServiceDto.occurenceType.includes(CUSTOM_DATES_PICKER) ||
        createServiceDto.occurenceType.includes(DATES_RANGE)) &&
      !createServiceDto.dates &&
      !createServiceDto.dates?.length
    ) {
      throw new BadRequestException(
        `Invalid Input provide date for Custom Date`,
      );
    }
    if (
      createServiceDto.prebookCutOff &&
      (createServiceDto.prebookCutOff < 0 ||
        createServiceDto.prebookCutOff > 30)
    ) {
      throw new BadRequestException(`Invlaid prebookCutOff`);
    }
    const service = await this.serviceService.create(createServiceDto);
    return {
      message: 'Service created successfully',
      result: new Service(service),
    };
  }

  @Permissions(GET_OCCURENCE)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOkResponse({
    type: OccurenceSwagger,
  })
  @Get('occurence')
  async occurence() {
    return {
      message: 'Occurences fetched successfully',
      result: OCCURENCE_CONST,
    };
  }

  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
  @Permissions(GET_SERVICE)
  @Get(':id')
  @ApiOperation({ summary: 'Fetch Service' })
  @ApiOkResponse({
    type: ServiceSwaggerById,
  })
  async findOne(@Param('id') id: string) {
    const service = await this.serviceService.findOne(id);
    return {
      message: 'Service Fetched successfully',
      result: new Service(service),
    };
  }

  @Permissions(DELETE_SERVICE)
  @ApiOkResponse({
    type: DeleteServiceSwagger,
  })
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        serviceCalendar: {
          include: {
            cartItems: { include: { cart: { include: { order: true } } } },
          },
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`Service not found`);
    }
    const deactiveCalender = [];
    const deletedCalender = [];
    if (service.serviceCalendar && service.serviceCalendar.length) {
      service.serviceCalendar.forEach((it) => {
        if (it.cartItems && it.cartItems.length) {
          it.cartItems.forEach((item) => {
            if (item.cart.order) {
              deactiveCalender.push(it.id);
            } else {
              deletedCalender.push(it.id);
            }
          });
        }
      });
    }
    await this.serviceService.remove(id, deactiveCalender, deletedCalender);
    return {
      message: 'Service deleted successfully',
      result: null,
    };
  }

  @Permissions(UPDATE_SERVICE)
  @ApiOkResponse({
    type: UpdateServiceSwagger,
  })
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSericeInput: UpdateServiceInput,
  ) {
    const fetchedService = await this.prisma.service.findUnique({
      where: { id },
      include: {
        ServiceType: true,
        temple: true,
        serviceCalendar: true,
        imageUrl: true,
      },
    });
    if (!fetchedService) {
      throw new NotFoundException(`Service not found`);
    }
    if (
      (updateSericeInput.occurenceType.includes(DATES_RANGE) ||
        updateSericeInput.occurenceType.includes(CUSTOM_DATES_PICKER)) &&
      !updateSericeInput.dates &&
      !updateSericeInput.dates?.length
    ) {
      throw new BadRequestException(
        `Invalid Input provide date for Custom Date`,
      );
    }
    const createServicedDto: CreateServiceDto = {
      serviceTypeId: fetchedService.ServiceType.id,
      templeId: fetchedService.temple.templeId,
      title: updateSericeInput.title,
      description: updateSericeInput.description,
      time: updateSericeInput.time,
      occurenceType: updateSericeInput.occurenceType,
      occurence: updateSericeInput.occurence,
      timing: updateSericeInput.timing,
      season: updateSericeInput.season,
      prebookCutOff: updateSericeInput.prebookCutOff,
      price: updateSericeInput.price,
      currency: updateSericeInput.currency,
      note: updateSericeInput.note,
      dates: updateSericeInput.dates,
    };
    let createdService;
    if (fetchedService.imageUrl) {
      createdService = await this.serviceService.create(
        createServicedDto,
        'imageUrl',
      );
    } else {
      createdService = await this.serviceService.create(createServicedDto);
    }
    if (!createdService) {
      throw new BadRequestException(
        `Something went Wrong while updating Service`,
      );
    }
    if (fetchedService.imageUrl) {
      await this.prisma.service.update({
        where: { id: createdService.id },
        data: {
          imageUrl: {
            connect: { id: fetchedService.imageUrl.id },
          },
        },
      });
    }
    const serviceCalendarIds = [];
    if (fetchedService.serviceCalendar?.length) {
      for (const calendar of fetchedService.serviceCalendar) {
        serviceCalendarIds.push(calendar.id);
      }
    }
    const carts = await this.prisma.cart.findMany({
      where: {
        cartItems: {
          some: { serviceCalendarId: { in: serviceCalendarIds } },
        },
        checkout: false,
      },
      select: { id: true },
    });
    const cartIds = [];
    if (carts.length) {
      carts.forEach((it) => {
        cartIds.push(it.id);
      });
    }
    if (cartIds.length) {
      await this.prisma.cart.deleteMany({
        where: { id: { in: cartIds } },
      });
    }
    await this.remove(id);
    return {
      message: 'Service updates successfully',
      result: new Service(createdService),
    };
  }

  @Permissions(UPDATE_SERVICE)
  @ApiOkResponse({
    type: UpdateServiceSwagger,
  })
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @Put('availability/:id')
  async enableOrDisableService(
    @Param('id') id: string,
    @Body() input: ServiceEnableOrDisableInput,
  ) {
    const updatedService = await this.serviceService.enableOrDisableService(
      id,
      input.isActive,
    );
    return {
      message: 'Service updates successfully',
      result: new Service(updatedService),
    };
  }

  @Permissions(CREATE_SERVICE)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @Post('donation')
  @ApiOkResponse({
    type: CreateDonationServiceSwagger,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('attachments', 3, {
      storage: diskStorage({
        destination: async (req, file, cb) =>
          cb(null, join('admin', 'donation')),
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  async createDonation(
    @Body() createDonation: CreateDonationDto,
    @UploadedFiles() attachments: Express.Multer.File[],
  ) {
    const serviceType = await this.prisma.serviceType.findUnique({
      where: { id: createDonation.serviceTypeId, isActive: true },
    });
    if (!serviceType || (serviceType && serviceType.type !== DONATION)) {
      throw new NotFoundException(`Servicetype not found`);
    }
    const temple = await this.prisma.temple.findUnique({
      where: { templeId: createDonation.templeId, isActive: true },
    });
    if (!temple) {
      throw new NotFoundException(`Temple not found`);
    }
    if (
      createDonation.type === FIXED &&
      createDonation.maxAmount !== createDonation.minAmount
    ) {
      throw new BadRequestException(
        `Maximum Amount and Minimum Amount should be same`,
      );
    } else if (
      createDonation.type === VARIABLE &&
      Number(createDonation.maxAmount) <= Number(createDonation.minAmount)
    ) {
      throw new BadRequestException(
        `Maximum Amount must be greater than Minimum Amount`,
      );
    }
    const createdDonation = await this.serviceService.createDonation(
      createDonation,
      attachments,
    );
    return {
      message: 'Donation Service created successfully',
      result: new DonationService(createdDonation),
    };
  }

  @Permissions(DELETE_SERVICE)
  @ApiOkResponse({
    type: DeleteDonationServiceSwagger,
  })
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @Delete('donation/:id')
  async removeDonation(@Param('id') id: string) {
    const donation = await this.prisma.service.findUnique({
      where: { id, isActive: true },
    });
    if (!donation) {
      throw new NotFoundException(`donation not found`);
    }
    await this.serviceService.removeDonation(id);
    return {
      message: 'Donation deleted successfully',
      result: null,
    };
  }

  @Permissions(UPDATE_SERVICE)
  @ApiOkResponse({
    type: UpdateDonationServiceSwagger,
  })
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @Put('donation/:id')
  async updateDonation(
    @Param('id') id: string,
    @Body() updateDonation: UpdateDonationDto,
  ) {
    const donation = await this.prisma.service.findUnique({
      where: { id, isActive: true },
      include: { temple: true, ServiceType: true },
    });
    if (!donation) {
      throw new NotFoundException(`donation not found`);
    }
    const config = donation.config as Prisma.JsonObject;
    if (
      donation.title === updateDonation.title &&
      donation.description === updateDonation.description &&
      donation.currency === updateDonation.currency &&
      donation.note === updateDonation.note &&
      config.minAmount === updateDonation.minAmount &&
      config.maxAmount === updateDonation.maxAmount
    ) {
      throw new BadRequestException(`invalid input`);
    }
    if (
      updateDonation.type === FIXED &&
      updateDonation.maxAmount !== updateDonation.minAmount
    ) {
      throw new BadRequestException(
        `Maximum Amount and Minimum Amount should be same`,
      );
    } else if (
      updateDonation.type === VARIABLE &&
      updateDonation.maxAmount <= updateDonation.minAmount
    ) {
      throw new BadRequestException(
        `Maximum Amount must be greater than Minimum Amount`,
      );
    }
    const updatedDonation = await this.serviceService.updateDonation(
      id,
      updateDonation,
      donation,
    );
    return {
      message: 'Donation updated successfully',
      result: new DonationService(updatedDonation),
    };
  }
}

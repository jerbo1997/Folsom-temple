import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Put,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { FamilyMemberService } from './family-member.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ROLE_USER } from 'src/const';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  CreateFamilyMemberSwagger,
  DeleteFamilyMembersSwagger,
  FamilyMembersSwagger,
  UpdateFamilyMemberSwagger,
} from 'src/utils/swagger/family-member.swagger';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserAndRole } from 'src/user/user.model';
import {
  CREATE_FAMILY_MEMBER,
  DELETE_FAMILY_MEMBER,
  GET_ALL_FAMILY_MEMBER,
  UPDATE_FAMILY_MEMBER,
} from 'src/auth/permissions.const';
import { FamilyMember } from './family-member.model';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('family-member')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiHeader({ name: 'role', enum: [ROLE_USER] })
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('family-member')
export class FamilyMemberController {
  constructor(
    private readonly familyMemberService: FamilyMemberService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(CREATE_FAMILY_MEMBER)
  @Post()
  @ApiOperation({ summary: 'Create FamilyMember' })
  @ApiOkResponse({
    type: CreateFamilyMemberSwagger,
  })
  async create(
    @Body() createFamilyMemberDto: CreateFamilyMemberDto,
    @CurrentUser() user: UserAndRole,
  ) {
    const familyMember: any = await this.familyMemberService.create(
      createFamilyMemberDto,
      user,
    );
    return {
      message: 'FamilyMember created successfully',
      result: new FamilyMember(familyMember),
    };
  }

  @Permissions(GET_ALL_FAMILY_MEMBER)
  @Get()
  @ApiOperation({ summary: 'Fetch all FamilyMembers' })
  @ApiOkResponse({
    type: FamilyMembersSwagger,
  })
  async findAll(
    @Query('operation') operation: string,
    @CurrentUser() user: UserAndRole,
  ) {
    const familyMember: any = await this.familyMemberService.findAll(
      operation,
      user,
    );
    return {
      message: 'FamilyMember fetched successfully',
      result: familyMember.map((it) => new FamilyMember(it)),
    };
  }

  /*@Get(':id')
  findOne(@Param('id') id: string) {
    return this.familyMemberService.findOne(id);
  }*/

  @Permissions(UPDATE_FAMILY_MEMBER)
  @Put(':id')
  @ApiOperation({ summary: 'Update FamilyMember' })
  @ApiOkResponse({
    type: UpdateFamilyMemberSwagger,
  })
  async update(
    @Param('id') id: string,
    @Body() updateFamilyMemberDto: UpdateFamilyMemberDto,
    @CurrentUser() user: UserAndRole,
  ) {
    const familyMember: any = await this.familyMemberService.update(
      id,
      updateFamilyMemberDto,
      user,
    );
    return {
      message: 'FamilyMember updated successfully',
      result: new FamilyMember(familyMember),
    };
  }

  @Permissions(DELETE_FAMILY_MEMBER)
  @Delete(':id')
  @ApiOperation({ summary: 'delete FamilyMember' })
  @ApiOkResponse({
    type: DeleteFamilyMembersSwagger,
  })
  async remove(@Param('id') id: string) {
    const existingFamilyMember = await this.prisma.familyMember.findUnique({
      where: { id },
    });
    if (!existingFamilyMember) {
      throw new NotFoundException('FamilyMember not found');
    }
    const familyMember: any = await this.familyMemberService.remove(id);
    return {
      message: 'FamilyMember deleted successfully',
      result: new FamilyMember(familyMember),
    };
  }
}

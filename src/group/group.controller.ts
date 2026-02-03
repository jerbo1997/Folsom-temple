import { ClassSerializerInterceptor, Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { GroupService } from './group.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { UserAndRole } from 'src/user/user.model';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { GroupSwagger } from 'src/utils/swagger/group.swagger';
import { Group } from './group.model';
import { GET_ALL_GROUPS } from 'src/auth/permissions.const';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';

@ApiTags('group')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) { }

  /*@Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }*/

  @Permissions(GET_ALL_GROUPS)
  @Get(':templeId')
  @ApiOperation({ summary: 'Fetch All Groups' })
  @ApiOkResponse({
    type: GroupSwagger,
  })
  async findAll(@Param('templeId') templeId: string, @CurrentUser() user: UserAndRole) {
    const groups = await this.groupService.findAll(templeId, user);
    return {
      message: 'Groups fetched successfully',
      result: groups.map((it) => new Group(it)),
    };
  }

  /*@Permissions()
  @Get(':id')
  @ApiOperation({ summary: 'Fetch Temple' })
  @ApiOkResponse({
    type: GroupSwaggerById,
  })
  async findOne(@Param('id') id: string) {
    const group = await this.groupService.findOne(id);
    return {
      message: 'Group Fetched successfully',
      result: new Group(group),
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(+id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(+id);
  }*/
}

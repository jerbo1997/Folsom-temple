import { ClassSerializerInterceptor, Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { MemberService } from './member.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';

@ApiTags('member')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) { }

  /*@Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Permissions()
  @Get()
  @ApiOperation({ summary: 'Fetch All Members' })
  @ApiOkResponse({
    type: MemberSwagger,
  })
  async findAll(@CurrentUser() user: UserAndRole) {
    const members = await this.memberService.findAll(user);
    return {
      message: 'Members fetched successfully',
      result: members.map((it) => new Member(it)),
    };
  }

  @Permissions()
  @Get(':id')
  @ApiOperation({ summary: 'Fetch Member' })
  @ApiOkResponse({
    type: MemberSwaggerById,
  })
  async findOne(@Param('id') id: string) {
    const member = await this.memberService.findOne(id);
    return {
      message: 'Member Fetched successfully',
      result: new Member(member),
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberService.remove(+id);
  }*/
}

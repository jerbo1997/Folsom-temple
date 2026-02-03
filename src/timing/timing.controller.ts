import { Controller, Get, Param, UseGuards, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { TimingService } from './timing.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import { Permissions } from 'src/auth/permissions.decorator';
import { TimingSwagger } from 'src/utils/swagger/timing.swagger';
import { Timings } from './timing.model';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserAndRole } from 'src/user/user.model';
import { GET_ALL_TIMINGS } from 'src/auth/permissions.const';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';

@ApiTags('timing')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('timing')
export class TimingController {
  constructor(private readonly timingService: TimingService) { }

  /*@Post()
  create(@Body() createTimingDto: CreateTimingDto) {
    return this.timingService.create(createTimingDto);
  }*/

  @Permissions(GET_ALL_TIMINGS)
  @Get(':templeId')
  @ApiOperation({ summary: 'Fetch All Timings' })
  @ApiOkResponse({
    type: TimingSwagger,
  })
  async findAll(@Param('templeId') templeId: string, @CurrentUser() user: UserAndRole) {
    const timings = await this.timingService.findAll(templeId, user);
    return {
      message: 'Timings fetched successfully',
      result: new Timings(timings)
    };
  }

  /*@Permissions()
  @Get(':id')
  @ApiOperation({ summary: 'Fetch Temple' })
  @ApiOkResponse({
    type: TimingSwaggerById,
  })
  async findOne(@Param('id') id: string) {
    const timing = await this.timingService.findOne(id);
    return {
      message: 'Temple Fetched successfully',
      result: new Timing(timing),
    };
  }

   @Patch(':id')
   update(@Param('id') id: string, @Body() updateTimingDto: UpdateTimingDto) {
     return this.timingService.update(+id, updateTimingDto);
   }
 
   @Delete(':id')
   remove(@Param('id') id: string) {
     return this.timingService.remove(+id);
   }*/
}

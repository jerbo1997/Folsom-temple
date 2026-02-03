import { Controller, Param, Delete, UseGuards } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { Permissions } from 'src/auth/permissions.decorator';
import { REMOVE_ATTACHMENT } from 'src/auth/permissions.const';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ROLE_ADMIN } from 'src/const';
import { ErrorResponse } from 'src/utils/common/common.model';
import { RemoveAttachmentSwagger } from 'src/utils/swagger/assets.swagger';

@ApiTags('attachments')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Permissions(REMOVE_ATTACHMENT)
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOkResponse({ type: RemoveAttachmentSwagger })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.attachmentService.remove(id);
    const result = { message: 'Attachment deleted successfully', result: null };
    if (!data) {
      result.message = 'Something went wrong, attachment deletion failed';
    }
    return result;
  }
}

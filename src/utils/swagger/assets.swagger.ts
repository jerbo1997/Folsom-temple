import { ApiProperty } from '@nestjs/swagger';
import { Asset } from 'src/asset/asset.model';
import { BaseResponse } from './base.swagger';

export class AssetSwagger extends BaseResponse {
  @ApiProperty({ type: Asset })
  result: Asset;
}

export class AllAssetsSwagger extends BaseResponse {
  @ApiProperty({ type: [Asset] })
  result: Asset[];
}

export class RemoveAttachmentSwagger extends BaseResponse {
  @ApiProperty()
  result: string;
}

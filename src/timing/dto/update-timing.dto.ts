import { PartialType } from '@nestjs/swagger';
import { CreateTimingDto } from './create-timing.dto';

export class UpdateTimingDto extends PartialType(CreateTimingDto) {}

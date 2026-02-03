import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';
import { Exclude, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class Timing {
    constructor(data: Partial<Timing>) {
        Object.assign(this, data);
    }

    @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
    id: string;

    @ApiProperty({ example: 'Monday to Friday' })
    title: string;

    @ApiProperty({ example: { startTime: '7:00 AM', endTime: "11:00 AM" } })
    timing: any;

    @Exclude()
    isActive: boolean;

    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;
}

export class Timings {
    constructor(data: Partial<Timings>) {
        Object.assign(this, data);
    }

    @ApiProperty({ example: 'Welcome Notes About Temple' })
    header: string

    @ApiProperty({ example: 'Conclution' })
    footer: string

    @ApiProperty({ type: [Timing] })
    @ValidateNested()
    @Type(() => Timing)
    timings?: Timing[]
}

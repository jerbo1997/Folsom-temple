import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Group } from 'src/group/group.model';
import { Timings } from 'src/timing/timing.model';

export class Temple {
    constructor(data: Partial<Temple>) {
        Object.assign(this, data);
    }

    @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
    id: string;

    @ApiProperty({ example: 'Lord Shiva Temple' })
    name: string;

    @ApiProperty({ example: ['0421-2412673'] })
    info: any;

    @ApiProperty({ example: 'Temp' })
    templeId: string;

    @ApiProperty({ example: 'TamilNadu' })
    state: string;

    @ApiProperty({ example: 'India' })
    country: string;

    @ApiProperty({ example: '641023' })
    postalCode: string;

    @Exclude()
    // @ApiProperty({ example: ['Temple Type'] })
    tags: string[];

    @ApiProperty({ example: ['Temple Type'] })
    history: any;

    @ApiProperty({ example: ['Temple Type'] })
    about: any;

    @Exclude()
    // @ApiProperty({
    //     example: [{
    //         header: 'Welcome Notes About Temple',
    //         footer: 'Welcome Notes About Temple'
    //     }]
    // })
    timingMeta: any

    @ApiProperty({ type: [Timings] })
    @ValidateNested({each:true})
    @Type(() => Timings)
    timings?: Timings[];

    @ApiProperty({ type: [Group] })
    @ValidateNested({each:true})
    @Type(() => Group)
    groups?: Group[];

    @Exclude()
    isPremium: boolean;

    @Exclude()
    isActive: boolean;

    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;
}

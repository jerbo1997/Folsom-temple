import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class Deity {
    constructor(data: Partial<Deity>) {
        Object.assign(this, data);
    }

    @ApiProperty({ example: 'wertyuicvnmhj' })
    id: String;

    @ApiProperty({ example: 'temple news' })
    title: string;

    @ApiProperty({ example: 'friday poojai' })
    description: string;

    @ApiProperty({ example: 'girivalam' })
    detail: string;

    @ApiProperty({ example: ['annamalayar'] })
    specialName: string[];

    @ApiProperty({ example: ['thiru'] })
    tag: string[];

    @ApiProperty({ example: ['god picture'] })
    imageUrl: string[];

    @Exclude()
    templeId: string;

    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;
}

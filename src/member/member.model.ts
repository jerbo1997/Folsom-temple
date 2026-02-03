import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class Member {
    constructor(data: Partial<Member>) {
        Object.assign(this, data);
    }

    @ApiProperty({ example: 'cllup3wki0001nevwa9ruv5o1' })
    id: string;

    @ApiProperty({ example: 'Krish' })
    name: string;

    @ApiProperty({ example: ['9876543210'] })
    contactNo: string[];

    @ApiProperty({ example: 'krish@18897@gmail.com' })
    email: string;

    @ApiProperty({ example: 'imageUrl' })
    imageUrl: string;

    @ApiProperty({ example: 'archagar' })
    designation: string;

    @ApiProperty({ example: 1234 })
    sortOrder: number;

    @Exclude()
    isActive: boolean;

    @Exclude()
    createdAt: Date;

    @Exclude()
    updatedAt: Date;
}

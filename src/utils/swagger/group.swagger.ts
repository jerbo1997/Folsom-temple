import { ApiProperty } from "@nestjs/swagger";
import { Group } from "src/group/group.model";

export class GroupSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Groups Fetched successfully' })
    message: string;

    @ApiProperty({ type: [Group] })
    result: Group[];

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class GroupSwaggerById {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Group Fetched successfully' })
    message: string;

    @ApiProperty({ type: Group })
    result: Group;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
import { ApiProperty } from "@nestjs/swagger";
import { Member } from "src/member/member.model";

export class MemberSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Members Fetched successfully' })
    message: string;

    @ApiProperty({ type: [Member] })
    result: Member[];

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class MemberSwaggerById {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Member Fetched successfully' })
    message: string;

    @ApiProperty({ type: Member })
    result: Member;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
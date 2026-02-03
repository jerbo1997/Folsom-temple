import { ApiProperty } from "@nestjs/swagger";
import { FamilyMember } from "src/family-member/family-member.model";

export class FamilyMembersSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Groups Fetched successfully' })
    message: string;

    @ApiProperty({ type: [FamilyMember] })
    result: FamilyMember[];

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class FamilyMemberSwaggerById {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Group Fetched successfully' })
    message: string;

    @ApiProperty({ type: FamilyMember })
    result: FamilyMember;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class CreateFamilyMemberSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'FamilyMember created successfully' })
    message: string;

    @ApiProperty({ type: FamilyMember })
    result: FamilyMember;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class UpdateFamilyMemberSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'FamilyMember updated successfully' })
    message: string;

    @ApiProperty({ type: FamilyMember })
    result: FamilyMember;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class DeleteFamilyMembersSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'FamilyMember Deleted successfully' })
    message: string;

    @ApiProperty({ type: FamilyMember })
    result: FamilyMember;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
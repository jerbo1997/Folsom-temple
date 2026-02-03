import { ApiProperty } from "@nestjs/swagger";
import { Deity } from "src/deity/deity.model";

export class DietySwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Deity created successfully' })
    message: string;

    @ApiProperty({ type: Deity })
    result: Deity;

    @ApiProperty({ example: false })
    isEncrypted: boolean;

   
}
export class FetchAllDeitySwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Deitys Fetched successfully' })
    message: string;

    @ApiProperty({ type: [Deity] })
    result: Deity;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
export class FetchDeitySwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Deity Fetched successfully' })
    message: string;

    @ApiProperty({ type: Deity })
    result: Deity;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
export class UpdatedDeitySwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Deity updated successfully' })
    message: string;

    @ApiProperty({ type: Deity })
    result: Deity;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
export class DeleteDeityswaggar  {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Deity updated successfully' })
    message: string;

    @ApiProperty({ type: Deity })
    result: Deity;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
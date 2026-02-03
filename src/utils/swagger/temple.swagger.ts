import { ApiProperty } from "@nestjs/swagger";
import { Temple } from "src/temple/temple.model";

export class TempleSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Temples Fetched successfully' })
    message: string;

    @ApiProperty({ type: [Temple] })
    result: Temple[];

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class TempleSwaggerById {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Temples Fetched successfully' })
    message: string;

    @ApiProperty({ type: Temple })
    result: Temple;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
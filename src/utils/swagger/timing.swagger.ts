import { ApiProperty } from "@nestjs/swagger";
import { Timings } from "src/timing/timing.model";

export class TimingSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Timings Fetched successfully' })
    message: string;

    @ApiProperty({ type: [Timings] })
    result: Timings[];

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class TimingSwaggerById {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Timing Fetched successfully' })
    message: string;

    @ApiProperty({ type: Timings })
    result: Timings;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
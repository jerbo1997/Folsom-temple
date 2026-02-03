import { ApiProperty } from "@nestjs/swagger";
import { ServiceCalendar, ServiceCalendars } from "src/service-calendar/service-calendar.model";

export class ServiceCalendarSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'ServiceCalendars Fetched successfully' })
    message: string;

    @ApiProperty({ type: [ServiceCalendars] })
    result: ServiceCalendars[];

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class ServiceCalendarSwaggerById {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'ServiceCalendar Fetched successfully' })
    message: string;

    @ApiProperty({ type: ServiceCalendar })
    result: ServiceCalendar;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
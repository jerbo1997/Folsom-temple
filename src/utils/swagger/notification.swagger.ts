import { ApiProperty } from "@nestjs/swagger";
import { Notification } from "src/notification/notification.model";

export class NotificationSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Notification Created successfully' })
    message: string;

    @ApiProperty({ type: Notification })
    result: Notification;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}
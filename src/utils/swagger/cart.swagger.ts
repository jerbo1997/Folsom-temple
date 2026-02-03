import { ApiProperty } from '@nestjs/swagger';
import { Cart } from 'src/cart/cart.model';

export class CartSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Cart Fetched successfully' })
    message: string;

    @ApiProperty({ type: Cart })
    result: Cart;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

export class ResetCartSwagger {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Cart reseted successfully' })
    message: string;

    @ApiProperty({ type: Cart })
    result: Cart;

    @ApiProperty({ example: false })
    isEncrypted: boolean;
}

import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateAddres } from 'src/address/dto/create-address.dto';

export class UpdateUserDto {
  @ApiProperty({ example: 'user1' })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({ example: 'Avitam' })
  @IsString()
  @IsOptional()
  star: string;

  @ApiProperty({ example: 'Kumbam' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  rasi: string;

  @ApiProperty({ example: 'Vishvamitra' })
  @IsString()
  @IsOptional()
  gothram: string;

  @ApiProperty({ example: 'male' })
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty({ example: '18/08/1997' })
  @IsDateString()
  @IsOptional()
  dob: Date;

  @ApiProperty({ example: 'user1@gmaill.com' })
  @IsString()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'image.com' })
  @IsString()
  @IsOptional()
  imageUrl: string;

  @ApiProperty({ type: CreateAddres })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAddres)
  address: CreateAddres;
}

export class UpdateFcm {
  @ApiProperty({ example: 'qwertyuio' })
  @IsOptional()
  @ValidateIf((o) => !o.iosFcmToken)
  @IsNotEmpty()
  androidFcmToken: string;

  @ApiProperty({ example: 'poiuytrewq' })
  @IsOptional()
  @ValidateIf((o) => !o.androidFcmToken)
  @IsNotEmpty()
  iosFcmToken: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePromoCodeDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ required: false, description: 'Used when discountType=FIXED (USD micros)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  amountMicros?: number | null;

  @ApiProperty({ required: false, description: 'Used when discountType=PERCENT (0..100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  percent?: number | null;

  @ApiProperty({ required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


import { ApiProperty } from '@nestjs/swagger';
import { BillingPeriod } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Plan id', example: 'uuid' })
  @IsString()
  planId!: string;

  @ApiProperty({ enum: BillingPeriod, example: BillingPeriod.MONTHLY })
  @IsEnum(BillingPeriod)
  billingPeriod!: BillingPeriod;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  seats!: number;

  @ApiProperty({ required: false, example: 'WELCOME10' })
  @IsOptional()
  @IsString()
  promoCode?: string;
}


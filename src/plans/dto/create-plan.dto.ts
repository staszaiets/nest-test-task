import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ example: 'starter' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Starter' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 29990000, description: 'USD micros' })
  @IsInt()
  @Min(0)
  basePriceMicros!: number;

  @ApiProperty({ example: 15750000, required: false, description: 'USD micros' })
  @IsOptional()
  @IsInt()
  @Min(0)
  pricePerSeatMicros?: number | null;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(0)
  includedApiCalls!: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


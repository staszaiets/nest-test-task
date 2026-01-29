import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { PricingService } from './pricing.service';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Post('calculate')
  calculate(@Body() dto: CalculatePriceDto) {
    return this.pricing.calculate(dto);
  }
}


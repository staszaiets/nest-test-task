import { Module } from '@nestjs/common';
import { PlansModule } from '../plans/plans.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

@Module({
  imports: [PlansModule, PromoCodesModule],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}


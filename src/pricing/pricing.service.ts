import { BadRequestException, Injectable } from '@nestjs/common';
import { BillingPeriod, DiscountType } from '@prisma/client';
import { PlansService } from '../plans/plans.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';

@Injectable()
export class PricingService {
  constructor(
    private readonly plans: PlansService,
    private readonly promoCodes: PromoCodesService,
  ) {}

  async calculate(dto: CalculatePriceDto) {
    const plan = await this.plans.getById(dto.planId);
    if (!plan.isActive) throw new BadRequestException('Plan is not active');

    const months = dto.billingPeriod === BillingPeriod.ANNUAL ? 12 : 1;
    const base = plan.basePriceMicros * months;
    const perSeat = (plan.pricePerSeatMicros ?? 0) * dto.seats * months;
    const subtotalMicros = base + perSeat;

    let discountMicros = 0;
    const appliedDiscounts: Array<{ type: string; amountMicros: number; details?: unknown }> = [];

    // Annual discount: 17% if billingPeriod=annual
    if (dto.billingPeriod === BillingPeriod.ANNUAL) {
      const annualDiscount = Math.floor((subtotalMicros * 17) / 100);
      discountMicros += annualDiscount;
      appliedDiscounts.push({ type: 'ANNUAL_17_PERCENT', amountMicros: annualDiscount });
    }

    // Promo code discount: fixed micros OR percent
    if (dto.promoCode) {
      const promo = await this.promoCodes.getActiveByCode(dto.promoCode);
      if (!promo) throw new BadRequestException('Invalid promo code');

      let promoDiscount = 0;
      if (promo.discountType === DiscountType.FIXED) {
        promoDiscount = promo.amountMicros ?? 0;
      } else if (promo.discountType === DiscountType.PERCENT) {
        promoDiscount = Math.floor((subtotalMicros * (promo.percent ?? 0)) / 100);
      }

      discountMicros += promoDiscount;
      appliedDiscounts.push({ type: 'PROMO', amountMicros: promoDiscount, details: { code: promo.code } });
    }

    if (discountMicros > subtotalMicros) discountMicros = subtotalMicros;
    const totalMicros = subtotalMicros - discountMicros;

    return {
      currency: 'USD',
      plan: {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        includedApiCalls: plan.includedApiCalls,
      },
      billingPeriod: dto.billingPeriod,
      seats: dto.seats,
      subtotalMicros,
      discountMicros,
      totalMicros,
      appliedDiscounts,
    };
  }
}


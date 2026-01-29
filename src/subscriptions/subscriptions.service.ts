import { BadRequestException, Injectable } from '@nestjs/common';
import { BillingPeriod, PaymentStatus, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from '../pricing/pricing.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { PaymentsService } from '../payments/payments.service';
import { AuthUser } from '../auth/types';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly promoCodes: PromoCodesService,
    private readonly payments: PaymentsService,
  ) {}

  async listForUser(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true, promoCode: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForUser(userId: string, id: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true, promoCode: true, payments: true },
    });
    if (!sub || sub.userId !== userId) return null;
    return sub;
  }

  async subscribe(user: AuthUser, dto: CreateSubscriptionDto) {
    const price = await this.pricing.calculate({
      planId: dto.planId,
      billingPeriod: dto.billingPeriod,
      seats: dto.seats,
      promoCode: dto.promoCode,
    });

    const promo = dto.promoCode ? await this.promoCodes.getActiveByCode(dto.promoCode) : null;
    if (dto.promoCode && !promo) throw new BadRequestException('Invalid promo code');

    const now = new Date();
    const periodEnd = dto.billingPeriod === BillingPeriod.ANNUAL ? addMonths(now, 12) : addMonths(now, 1);

    // Create subscription first, then payment via regional provider, then persist payment
    const subscription = await this.prisma.subscription.create({
      data: {
        userId: user.id,
        planId: dto.planId,
        promoCodeId: promo?.id ?? null,
        billingPeriod: dto.billingPeriod,
        seats: dto.seats,
        status: SubscriptionStatus.ACTIVE,
        currency: price.currency,
        subtotalMicros: price.subtotalMicros,
        discountMicros: price.discountMicros,
        totalMicros: price.totalMicros,
        provider: this.payments.pickProvider(user.region),
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    const paymentResult = await this.payments.createPayment(user.region, {
      amountMicros: price.totalMicros,
      currency: price.currency,
      subscriptionId: subscription.id,
      customerRef: user.id,
    });

    const payment = await this.prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        provider: paymentResult.provider,
        providerRef: paymentResult.providerRef,
        status: paymentResult.status === 'SUCCEEDED' ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
        amountMicros: price.totalMicros,
        currency: price.currency,
        raw: paymentResult.raw as any,
      },
    });

    // If payment failed, mark subscription as canceled for simplicity
    if (payment.status === PaymentStatus.FAILED) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.CANCELED, canceledAt: new Date() },
      });
    }

    const full = await this.prisma.subscription.findUnique({
      where: { id: subscription.id },
      include: { plan: true, promoCode: true, payments: true },
    });

    return { subscription: full, payment };
  }
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}


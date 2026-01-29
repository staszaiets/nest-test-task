import { Injectable } from '@nestjs/common';
import { PaymentProvider, Region } from '@prisma/client';
import { MonobankProvider } from './providers/monobank.provider';
import { PixProvider } from './providers/pix.provider';
import { StripeProvider } from './providers/stripe.provider';
import { CreatePaymentInput, CreatePaymentResult } from './providers/payment-provider.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly monobank: MonobankProvider,
    private readonly pix: PixProvider,
    private readonly stripe: StripeProvider,
  ) {}

  pickProvider(region: Region): PaymentProvider {
    if (region === Region.UA) return PaymentProvider.MONOBANK;
    if (region === Region.BR) return PaymentProvider.PIX;
    return PaymentProvider.STRIPE;
  }

  async createPayment(region: Region, input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const provider = this.pickProvider(region);
    if (provider === PaymentProvider.MONOBANK) return this.monobank.createPayment(input);
    if (provider === PaymentProvider.PIX) return this.pix.createPayment(input);
    return this.stripe.createPayment(input);
  }
}


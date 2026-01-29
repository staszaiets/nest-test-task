import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';
import { CreatePaymentInput, CreatePaymentResult, PaymentProviderClient } from './payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProviderClient {
  provider = PaymentProvider.STRIPE;

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      provider: this.provider,
      providerRef: `stripe_${input.subscriptionId}_${Date.now()}`,
      status: 'SUCCEEDED',
      raw: { mocked: true, region: 'OTHER', input },
    };
  }
}


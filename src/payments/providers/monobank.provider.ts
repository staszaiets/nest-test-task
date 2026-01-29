import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';
import { CreatePaymentInput, CreatePaymentResult, PaymentProviderClient } from './payment-provider.interface';

@Injectable()
export class MonobankProvider implements PaymentProviderClient {
  provider = PaymentProvider.MONOBANK;

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // Mock: always succeeds, generate deterministic-ish ref
    return {
      provider: this.provider,
      providerRef: `mono_${input.subscriptionId}_${Date.now()}`,
      status: 'SUCCEEDED',
      raw: { mocked: true, region: 'UA', input },
    };
  }
}


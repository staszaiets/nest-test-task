import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '@prisma/client';
import { CreatePaymentInput, CreatePaymentResult, PaymentProviderClient } from './payment-provider.interface';

@Injectable()
export class PixProvider implements PaymentProviderClient {
  provider = PaymentProvider.PIX;

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      provider: this.provider,
      providerRef: `pix_${input.subscriptionId}_${Date.now()}`,
      status: 'SUCCEEDED',
      raw: { mocked: true, region: 'BR', input },
    };
  }
}


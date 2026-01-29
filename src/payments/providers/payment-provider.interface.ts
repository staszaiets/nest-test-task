import { PaymentProvider } from '@prisma/client';

export type CreatePaymentInput = {
  amountMicros: number;
  currency: string;
  subscriptionId: string;
  customerRef: string;
};

export type CreatePaymentResult = {
  provider: PaymentProvider;
  providerRef: string;
  status: 'SUCCEEDED' | 'FAILED';
  raw?: unknown;
};

export interface PaymentProviderClient {
  provider: PaymentProvider;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
}


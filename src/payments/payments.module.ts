import { Module } from '@nestjs/common';
import { MonobankProvider } from './providers/monobank.provider';
import { PixProvider } from './providers/pix.provider';
import { StripeProvider } from './providers/stripe.provider';
import { PaymentsService } from './payments.service';

@Module({
  providers: [PaymentsService, MonobankProvider, PixProvider, StripeProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}


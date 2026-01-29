import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';

@Injectable()
export class PromoCodesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.promoCode.findMany({ orderBy: { createdAt: 'asc' } });
  }

  async getById(id: string) {
    const pc = await this.prisma.promoCode.findUnique({ where: { id } });
    if (!pc) throw new NotFoundException('Promo code not found');
    return pc;
  }

  async getActiveByCode(code: string) {
    const pc = await this.prisma.promoCode.findUnique({ where: { code } });
    if (!pc || !pc.isActive) return null;
    if (pc.expiresAt && pc.expiresAt.getTime() <= Date.now()) return null;
    return pc;
  }

  create(dto: CreatePromoCodeDto) {
    this.validate(dto);
    return this.prisma.promoCode.create({ data: dto });
  }

  async update(id: string, dto: UpdatePromoCodeDto) {
    await this.getById(id);
    this.validate(dto);
    return this.prisma.promoCode.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getById(id);
    await this.prisma.promoCode.delete({ where: { id } });
    return { ok: true };
  }

  private validate(dto: Partial<CreatePromoCodeDto>) {
    if (!dto.discountType) return;
    if (dto.discountType === 'FIXED') {
      if (dto.amountMicros == null) throw new BadRequestException('amountMicros is required for FIXED promo');
    }
    if (dto.discountType === 'PERCENT') {
      if (dto.percent == null) throw new BadRequestException('percent is required for PERCENT promo');
    }
  }
}


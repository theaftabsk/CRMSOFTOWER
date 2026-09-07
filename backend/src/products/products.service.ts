import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.product.findMany({
      where: { organization_id: orgId },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(orgId: string, data: any) {
    return this.prisma.product.create({
      data: {
        organization_id: orgId,
        code: data.code || `PRD-${Date.now().toString().slice(-4)}`,
        name: data.name,
        category: data.category || 'General',
        unit_price: Number(data.unit_price) || 0,
        stock: Number(data.stock) || 0,
        gst_rate_percent: Number(data.gst_rate_percent) || 18,
      },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findById(orgId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organization_id: orgId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(orgId: string, data: any) {
    return this.prisma.product.create({
      data: {
        organization_id: orgId,
        code: data.code || `PRD-${Date.now().toString().slice(-4)}`,
        name: data.name,
        category: data.category || 'Software Services',
        unit_price: Number(data.unit_price) || 0,
        stock: Number(data.stock) ?? 50,
        gst_rate_percent: Number(data.gst_rate_percent) ?? 18,
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    await this.findById(orgId, id);
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.name && { name: data.name }),
        ...(data.category && { category: data.category }),
        ...(data.unit_price !== undefined && { unit_price: Number(data.unit_price) }),
        ...(data.stock !== undefined && { stock: Number(data.stock) }),
        ...(data.gst_rate_percent !== undefined && { gst_rate_percent: Number(data.gst_rate_percent) }),
      },
    });
  }

  async delete(orgId: string, id: string) {
    await this.findById(orgId, id);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getStats(orgId: string) {
    const products = await this.prisma.product.findMany({
      where: { organization_id: orgId },
    });

    const totalProducts = products.length;
    const totalValuation = products.reduce((acc, p) => acc + (p.unit_price * (p.stock || 1)), 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
    const avgGSTRate = totalProducts > 0 
      ? Math.round(products.reduce((acc, p) => acc + (p.gst_rate_percent || 18), 0) / totalProducts)
      : 18;

    return {
      totalProducts,
      totalValuation,
      lowStockCount,
      outOfStockCount,
      categoriesCount: uniqueCategories.length,
      avgGSTRate,
      categories: uniqueCategories,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(orgId: string, query: string) {
    if (!query || query.trim().length === 0) return { leads: [], contacts: [], accounts: [], deals: [] };
    const q = query.trim();

    const [leads, contacts, accounts, deals] = await Promise.all([
      this.prisma.lead.findMany({
        where: { organization_id: orgId, OR: [{ name: { contains: q, mode: 'insensitive' } }, { company: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }),
      this.prisma.contact.findMany({
        where: { organization_id: orgId, OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }),
      this.prisma.account.findMany({
        where: { organization_id: orgId, name: { contains: q, mode: 'insensitive' } },
        take: 5,
      }),
      this.prisma.deal.findMany({
        where: { organization_id: orgId, title: { contains: q, mode: 'insensitive' } },
        take: 5,
      }),
    ]);

    return { leads, contacts, accounts, deals };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string = 'ORG001') {
    return this.prisma.contact.findMany({
      where: { organization_id: orgId },
      orderBy: { created_date: 'desc' },
    });
  }

  async create(data: any, orgId: string = 'ORG001') {
    return this.prisma.contact.create({
      data: {
        organization_id: orgId,
        account_id: data.account_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        designation: data.designation || 'Key Stakeholder',
        company: data.company,
        city: data.city || 'Tech City',
      },
    });
  }
}

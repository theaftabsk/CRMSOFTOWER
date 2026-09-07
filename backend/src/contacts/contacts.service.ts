import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.contact.findMany({
      where: { organization_id: orgId },
      include: { account: true },
      orderBy: { created_date: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const contact = await this.prisma.contact.findFirst({
      where: { id, organization_id: orgId },
      include: { account: true },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async create(orgId: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: {
        organization_id: orgId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        designation: dto.designation || 'Executive',
        city: dto.city || 'Kolkata',
        status: dto.status || 'Active',
        account_id: dto.account_id || null,
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }

  async remove(orgId: string, id: string) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}

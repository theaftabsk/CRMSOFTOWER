import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadDto, ConvertLeadDto } from './crm.interface';

@Injectable()
export class LeadsService {
  private leads: LeadDto[] = [
    {
      id: 'LED001',
      organization_id: 'ORG001',
      first_name: 'Rahul',
      last_name: 'Sharma',
      phone: '9876512340',
      email: 'rahul@abcschool.edu.in',
      company: 'ABC School',
      website: 'https://abcschool.edu.in',
      industry: 'Education',
      source: 'Website',
      status: 'Interested',
      rating: 'Hot',
      owner_id: 'USR003',
      owner_name: 'Sales Executive 1 (Rohan)',
      expected_value: 50000,
      location: 'Kolkata, WB',
      tags: ['VIP', 'Website'],
      notes: 'Customer wants complete ERP website and student portal within ₹50,000 budget.',
      next_followup_date: '2026-09-10T11:00'
    },
    {
      id: 'LED002',
      organization_id: 'ORG001',
      first_name: 'Amit',
      last_name: 'Patel',
      phone: '9812345678',
      email: 'amit@technosolutions.com',
      company: 'Techno Solutions',
      website: 'https://technosolutions.com',
      industry: 'Information Technology',
      source: 'Facebook',
      status: 'Contacted',
      rating: 'Warm',
      owner_id: 'USR004',
      owner_name: 'Sales Executive 2 (Priya)',
      expected_value: 120000,
      location: 'Mumbai, MH',
      tags: ['High Value'],
      notes: 'Interested in custom CRM Software implementation.',
      next_followup_date: '2026-09-08T14:30'
    }
  ];

  findAll(organizationId: string): LeadDto[] {
    return this.leads.filter(l => l.organization_id === organizationId);
  }

  create(leadDto: LeadDto): LeadDto {
    const id = `LED${String(this.leads.length + 1).padStart(3, '0')}`;
    const newLead = { ...leadDto, id };
    this.leads.push(newLead);
    return newLead;
  }

  convertLead(dto: ConvertLeadDto) {
    const lead = this.leads.find(l => l.id === dto.leadId);
    if (!lead) throw new NotFoundException('Lead not found');

    lead.status = 'Converted';

    return {
      success: true,
      message: 'Lead successfully converted to Contact, Account, and Deal',
      contact: {
        id: `CON${Date.now()}`,
        name: `${lead.first_name} ${lead.last_name}`,
        phone: lead.phone,
        email: lead.email,
        account_name: lead.company
      },
      account: {
        id: `ACC${Date.now()}`,
        name: lead.company,
        industry: lead.industry || 'General'
      },
      deal: dto.createDeal ? {
        id: `DL${Date.now()}`,
        title: dto.dealTitle || `${lead.company} Deal`,
        value: dto.dealValue || lead.expected_value,
        stage: 'New'
      } : null
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DuplicateCheckInput {
  email: string;
  phone?: string;
  company?: string;
  name?: string;
  excludeId?: string;
}

export interface MergeInput {
  primaryId: string;
  secondaryId: string;
  fields?: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    job_title?: string;
    industry?: string;
    budget?: number;
    expected_value?: number;
    assigned_to?: string;
  };
}

@Injectable()
export class DeduplicationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Scans for exact, strong, and domain-based duplicates
   */
  async findDuplicates(orgId: string, input: DuplicateCheckInput) {
    const cleanEmail = (input.email || '').trim().toLowerCase();
    const cleanPhone = (input.phone || '').replace(/[^0-9]/g, '');
    const cleanCompany = (input.company || '').trim().toLowerCase();
    const cleanName = (input.name || '').trim().toLowerCase();

    const candidates = await this.prisma.lead.findMany({
      where: {
        organization_id: orgId,
        NOT: input.excludeId ? { id: input.excludeId } : undefined,
      },
      include: {
        activities: { take: 3, orderBy: { created_at: 'desc' } },
      },
    });

    const exactMatches: any[] = [];
    const strongMatches: any[] = [];
    const possibleMatches: any[] = [];

    const emailDomain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '';

    candidates.forEach(c => {
      const cEmail = (c.email || '').toLowerCase();
      const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
      const cCompany = (c.company || '').toLowerCase();
      const cName = (c.name || '').toLowerCase();

      // 1. Exact Match: Identical Email or Phone
      if ((cleanEmail && cEmail === cleanEmail) || (cleanPhone.length >= 8 && cPhone === cleanPhone)) {
        exactMatches.push({ ...c, match_reason: cleanEmail === cEmail ? 'Identical Email' : 'Identical Phone Number' });
        return;
      }

      // 2. Strong Match: Same Company + Same Contact Name
      if (cleanCompany && cCompany === cleanCompany && cleanName && cName === cleanName) {
        strongMatches.push({ ...c, match_reason: 'Matching Company & Contact Name' });
        return;
      }

      // 3. Possible Match: Same Corporate Domain or Company Name
      if (emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain)) {
        if (cEmail.endsWith(`@${emailDomain}`)) {
          possibleMatches.push({ ...c, match_reason: `Shared Domain (@${emailDomain})` });
          return;
        }
      }

      if (cleanCompany && cCompany === cleanCompany) {
        possibleMatches.push({ ...c, match_reason: 'Matching Company Name' });
      }
    });

    const hasDuplicates = exactMatches.length > 0 || strongMatches.length > 0 || possibleMatches.length > 0;
    const matchType = exactMatches.length > 0 
      ? 'EXACT' 
      : strongMatches.length > 0 
        ? 'STRONG' 
        : possibleMatches.length > 0 
          ? 'POSSIBLE' 
          : 'NONE';

    const mergedList = [...exactMatches, ...strongMatches, ...possibleMatches];

    return {
      has_duplicates: hasDuplicates,
      match_type: matchType,
      total_matches: mergedList.length,
      duplicates: mergedList,
    };
  }

  /**
   * Merges secondary lead record into primary record, combining activities without data loss
   */
  async mergeLeads(orgId: string, input: MergeInput) {
    const primary = await this.prisma.lead.findUnique({
      where: { id: input.primaryId },
      include: { activities: true },
    });
    const secondary = await this.prisma.lead.findUnique({
      where: { id: input.secondaryId },
      include: { activities: true },
    });

    if (!primary || primary.organization_id !== orgId) {
      throw new NotFoundException('Primary lead record not found');
    }
    if (!secondary || secondary.organization_id !== orgId) {
      throw new NotFoundException('Secondary lead record not found');
    }
    if (primary.id === secondary.id) {
      throw new BadRequestException('Cannot merge a lead record with itself');
    }

    // 1. Determine consolidated field values (prefer explicit override or primary)
    const updatedData: any = {
      name: input.fields?.name || primary.name || secondary.name,
      company: input.fields?.company || primary.company || secondary.company,
      email: input.fields?.email || primary.email || secondary.email,
      phone: input.fields?.phone || primary.phone || secondary.phone,
      job_title: input.fields?.job_title || primary.job_title || secondary.job_title,
      industry: input.fields?.industry || primary.industry || secondary.industry,
      budget: input.fields?.budget || primary.budget || secondary.budget,
      expected_value: input.fields?.expected_value || primary.expected_value || secondary.expected_value,
      assigned_to: input.fields?.assigned_to || primary.assigned_to || secondary.assigned_to,
      notes: [primary.notes, secondary.notes].filter(Boolean).join('\n-- Merged Note --\n'),
    };

    // 2. Update Primary Lead
    const updatedPrimary = await this.prisma.lead.update({
      where: { id: primary.id },
      data: updatedData,
    });

    // 3. Migrate all activities from Secondary Lead to Primary Lead
    await this.prisma.leadActivity.updateMany({
      where: { lead_id: secondary.id },
      data: { lead_id: primary.id },
    });

    // 4. Log Merge Audit Activity on Primary Lead
    await this.prisma.leadActivity.create({
      data: {
        organization_id: orgId,
        lead_id: primary.id,
        type: 'STAGE_CHANGE',
        title: `Merged duplicate lead: ${secondary.name} (${secondary.company})`,
        description: `Consolidated all contact details and historical activity timeline into primary record.`,
        source: 'SYSTEM',
        direction: 'INBOUND',
        status: 'COMPLETED',
        metadata: {
          merged_from_id: secondary.id,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // 5. Delete Secondary Record
    await this.prisma.lead.delete({
      where: { id: secondary.id },
    });

    return {
      success: true,
      message: `Successfully merged lead '${secondary.name}' into '${primary.name}'`,
      primary_lead: updatedPrimary,
    };
  }
}

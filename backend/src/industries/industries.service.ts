import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  BACKEND_INDUSTRY_TEMPLATES, 
  BackendIndustryTemplate 
} from './industries.constants';
import { ApplyIndustryDto } from './dto/apply-industry.dto';

@Injectable()
export class IndustriesService {
  private readonly logger = new Logger(IndustriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Return all available industry vertical presets with rich metadata
   */
  getAllIndustries(): BackendIndustryTemplate[] {
    return Object.values(BACKEND_INDUSTRY_TEMPLATES);
  }

  /**
   * Return a single industry template by its ID
   */
  getIndustryById(industryId: string): BackendIndustryTemplate {
    const cleanId = industryId.toLowerCase().replace(/[\s&/\\-]+/g, '_');
    const template = BACKEND_INDUSTRY_TEMPLATES[cleanId];
    if (!template) {
      if (cleanId.includes('real') || cleanId.includes('estate') || cleanId.includes('property')) {
        return BACKEND_INDUSTRY_TEMPLATES.real_estate;
      }
      if (cleanId.includes('travel') || cleanId.includes('tour')) {
        return BACKEND_INDUSTRY_TEMPLATES.travel_tourism;
      }
      if (cleanId.includes('school') || cleanId.includes('college') || cleanId.includes('education')) {
        return BACKEND_INDUSTRY_TEMPLATES.education;
      }
      if (cleanId.includes('restaurant') || cleanId.includes('cater') || cleanId.includes('food')) {
        return BACKEND_INDUSTRY_TEMPLATES.restaurant_catering;
      }
      if (cleanId.includes('retail') || cleanId.includes('store') || cleanId.includes('wholesale')) {
        return BACKEND_INDUSTRY_TEMPLATES.retail_wholesale;
      }
      if (cleanId.includes('health') || cleanId.includes('clinic')) {
        return BACKEND_INDUSTRY_TEMPLATES.healthcare_clinic;
      }
      return BACKEND_INDUSTRY_TEMPLATES.saas_it;
    }
    return template;
  }

  /**
   * Retrieve the current organization's active industry configuration from PostgreSQL database.
   */
  async getCurrentOrganizationIndustry(orgId: string) {
    try {
      const record = await this.prisma.appIntegration.findUnique({
        where: {
          organization_id_app_id: {
            organization_id: orgId,
            app_id: 'industry_preset',
          },
        },
      });

      if (record && record.config) {
        return {
          persisted_in_database: true,
          status: record.status,
          config: record.config,
        };
      }
    } catch (err) {
      this.logger.warn(`Could not read industry config from database: ${err}`);
    }

    const fallbackTemplate = BACKEND_INDUSTRY_TEMPLATES.saas_it;
    return {
      persisted_in_database: false,
      status: 'DEFAULT',
      config: {
        industry_id: fallbackTemplate.id,
        industry_name: fallbackTemplate.name,
        deal_terminology: fallbackTemplate.dealTerminology,
        deals_terminology: fallbackTemplate.dealsTerminology,
        lead_terminology: fallbackTemplate.leadTerminology,
        target_monthly_revenue: fallbackTemplate.targetMonthlyRevenue,
        pipeline_stages: fallbackTemplate.pipelineStages,
      },
    };
  }

  /**
   * Apply an industry template to an organization.
   * Persists all configurations, custom fields, web forms, sample leads, and sample deals into the database.
   */
  async applyIndustryTemplate(orgId: string, dto: ApplyIndustryDto) {
    const template = this.getIndustryById(dto.industry_id);
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new NotFoundException(`Organization with id '${orgId}' not found.`);
    }

    const seedCustomFields = dto.seed_custom_fields ?? true;
    const seedDeals = dto.seed_sample_deals ?? true;
    const seedForm = dto.seed_webform ?? true;

    const pipelineStagesToSave = dto.pipeline_stages && dto.pipeline_stages.length > 0
      ? dto.pipeline_stages
      : template.pipelineStages;

    const targetRevenueToSave = dto.target_monthly_revenue || `₹${template.targetMonthlyRevenue.toLocaleString('en-IN')}`;

    // 1. Persist Industry Configuration in PostgreSQL AppIntegration table
    await this.prisma.appIntegration.upsert({
      where: {
        organization_id_app_id: {
          organization_id: orgId,
          app_id: 'industry_preset',
        },
      },
      update: {
        name: `${template.name} Vertical Configuration`,
        category: 'INDUSTRY',
        status: 'CONNECTED',
        config: {
          industry_id: template.id,
          industry_name: template.name,
          badge: template.badge,
          icon_name: template.iconName,
          deal_terminology: template.dealTerminology,
          deals_terminology: template.dealsTerminology,
          lead_terminology: template.leadTerminology,
          target_monthly_revenue: targetRevenueToSave,
          pipeline_stages: pipelineStagesToSave,
          configured_at: new Date().toISOString(),
        },
        health_status: 'HEALTHY',
        last_tested_at: new Date(),
        updated_at: new Date(),
      },
      create: {
        organization_id: orgId,
        app_id: 'industry_preset',
        name: `${template.name} Vertical Configuration`,
        category: 'INDUSTRY',
        status: 'CONNECTED',
        config: {
          industry_id: template.id,
          industry_name: template.name,
          badge: template.badge,
          icon_name: template.iconName,
          deal_terminology: template.dealTerminology,
          deals_terminology: template.dealsTerminology,
          lead_terminology: template.leadTerminology,
          target_monthly_revenue: targetRevenueToSave,
          pipeline_stages: pipelineStagesToSave,
          configured_at: new Date().toISOString(),
        },
        health_status: 'HEALTHY',
        last_tested_at: new Date(),
      },
    });

    const results = {
      industry_id: template.id,
      industry_name: template.name,
      deal_terminology: template.dealTerminology,
      custom_fields_created: 0,
      products_created: 0,
      leads_created: 0,
      deals_created: 0,
      form_created: false,
      database_persisted: true,
    };

    // 2. Seed Real Custom Fields into PostgreSQL CustomField table
    if (seedCustomFields && template.customFields.length > 0) {
      for (const field of template.customFields) {
        const existing = await this.prisma.customField.findFirst({
          where: {
            organization_id: orgId,
            entity_type: field.entity_type,
            field_name: field.field_name,
          },
        });

        if (!existing) {
          await this.prisma.customField.create({
            data: {
              organization_id: orgId,
              entity_type: field.entity_type,
              field_name: field.field_name,
              field_type: field.field_type,
              options: field.options || [],
            },
          });
          results.custom_fields_created++;
        }
      }
    }

    // 3. Seed Real Products/Services into PostgreSQL Product table
    if (template.sampleProducts && template.sampleProducts.length > 0) {
      const prodCount = await this.prisma.product.count({
        where: { organization_id: orgId },
      });

      if (prodCount < 2) {
        for (const prod of template.sampleProducts) {
          const existingProd = await this.prisma.product.findFirst({
            where: { organization_id: orgId, code: prod.code },
          });
          if (!existingProd) {
            await this.prisma.product.create({
              data: {
                organization_id: orgId,
                code: prod.code,
                name: prod.name,
                category: prod.category,
                unit_price: prod.unit_price,
                stock: prod.stock,
                gst_rate_percent: prod.gst_rate_percent,
              },
            });
            results.products_created++;
          }
        }
      }
    }

    // 4. Seed Real Leads into PostgreSQL Lead table
    if (template.sampleLeads && template.sampleLeads.length > 0) {
      const leadCount = await this.prisma.lead.count({
        where: { organization_id: orgId },
      });

      if (leadCount < 2) {
        for (const lead of template.sampleLeads) {
          await this.prisma.lead.create({
            data: {
              organization_id: orgId,
              name: lead.name,
              company: lead.company,
              email: lead.email,
              phone: lead.phone,
              city: lead.city,
              source: lead.source,
              expected_value: lead.expected_value,
              notes: lead.notes,
              status: lead.status,
              lifecycle_stage: lead.lifecycle_stage,
              assigned_to: 'Sales Executive',
            },
          });
          results.leads_created++;
        }
      }
    }

    // 5. Seed Real Deals into PostgreSQL Deal table
    if (seedDeals && template.sampleDeals.length > 0) {
      const dealCount = await this.prisma.deal.count({
        where: { organization_id: orgId },
      });

      if (dealCount < 2) {
        for (const deal of template.sampleDeals) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + 21);

          await this.prisma.deal.create({
            data: {
              organization_id: orgId,
              title: deal.title,
              account_name: deal.account_name,
              value: deal.value,
              stage: deal.stage,
              probability: deal.probability,
              closing_date: futureDate.toISOString().split('T')[0],
              owner: 'Admin',
              pipeline_name: deal.pipeline_name,
            },
          });
          results.deals_created++;
        }
      }
    }

    // 6. Seed Ready-to-Embed WebForm into PostgreSQL WebForm table
    if (seedForm && template.webFormPreset) {
      const existingForm = await this.prisma.webForm.findFirst({
        where: {
          organization_id: orgId,
          title: template.webFormPreset.title,
        },
      });

      if (!existingForm) {
        await this.prisma.webForm.create({
          data: {
            organization_id: orgId,
            title: template.webFormPreset.title,
            description: template.webFormPreset.description,
            submit_btn_text: template.webFormPreset.submit_btn_text,
            success_message: template.webFormPreset.success_message,
            layout: 'classic',
            status: 'PUBLISHED',
            fields: template.webFormPreset.fields,
            theme: {
              palette: 'monochrome',
              borderRadius: 'rounded-xl',
              font: 'Inter',
            },
            settings: {
              leadSource: 'WebForm',
              notifyEmail: true,
            },
          },
        });
        results.form_created = true;
      }
    }

    // 7. Log Action to AuditLog Table in PostgreSQL
    try {
      await this.prisma.auditLog.create({
        data: {
          organization_id: orgId,
          user_name: 'System',
          action: 'INDUSTRY_VERTICAL_ACTIVATED',
          entity_type: 'Organization',
          entity_id: orgId,
          new_value: JSON.stringify({
            industry_id: template.id,
            industry_name: template.name,
            deal_terminology: template.dealTerminology,
            products_count: results.products_created,
            leads_count: results.leads_created,
            deals_count: results.deals_created,
          }),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (auditErr) {
      this.logger.warn(`Failed to log audit for industry apply: ${auditErr}`);
    }

    this.logger.log(`[Production Database] Persisted 100% real industry data for '${template.name}' in org ${orgId}`);
    return results;
  }
}

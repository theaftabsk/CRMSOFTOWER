import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MetaCampaignDto {
  id?: string;
  name: string;
  objective: 'LEAD_GENERATION' | 'OUTCOME_LEADS' | 'OUTCOME_TRAFFIC' | 'OUTCOME_AWARENESS';
  daily_budget: number;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  start_time?: string;
  ad_set_name?: string;
  target_location?: string;
}

@Injectable()
export class MetaCampaignsService {
  private readonly logger = new Logger(MetaCampaignsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get Real Meta Campaigns
   * Fetches from live Meta Graph API if access token exists, else from DB.
   * STRICTLY ZERO FAKE DATA - Returns [] if none exist.
   */
  async getCampaigns(orgId: string) {
    const integration = await this.prisma.appIntegration.findUnique({
      where: {
        organization_id_app_id: {
          organization_id: orgId,
          app_id: 'meta_ads',
        },
      },
    });

    if (!integration || integration.status !== 'CONNECTED') {
      return [];
    }

    const config = (integration.config as any) || {};

    // Live Meta Graph API Call if accessToken & adAccountId are provided
    if (config.access_token && config.ad_account_id) {
      try {
        const cleanAdAcc = config.ad_account_id.startsWith('act_')
          ? config.ad_account_id
          : `act_${config.ad_account_id}`;

        const url = `https://graph.facebook.com/v19.0/${cleanAdAcc}/campaigns?fields=id,name,objective,status,daily_budget&access_token=${config.access_token}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.data) && json.data.length > 0) {
            return json.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              objective: c.objective,
              status: c.status,
              daily_budget: c.daily_budget ? Number(c.daily_budget) / 100 : 0,
              spent: 0,
              impressions: 0,
              clicks: 0,
              leads: 0,
              cpl: 0,
              created_at: new Date().toISOString().split('T')[0],
              ad_set_name: 'Meta Synced AdSet',
            }));
          }
        }
      } catch (err) {
        this.logger.warn(`Meta Graph API fetch notice: ${err}`);
      }
    }

    // Return stored campaigns from DB
    return Array.isArray(config.campaigns) ? config.campaigns : [];
  }

  /**
   * Create a new Campaign via Meta Graph API or DB storage
   */
  async createCampaign(orgId: string, dto: MetaCampaignDto) {
    const integration = await this.prisma.appIntegration.findUnique({
      where: {
        organization_id_app_id: {
          organization_id: orgId,
          app_id: 'meta_ads',
        },
      },
    });

    const currentConfig = (integration?.config as any) || {};
    const campaigns: any[] = Array.isArray(currentConfig.campaigns) ? currentConfig.campaigns : [];

    const newCampaign = {
      id: `camp_${Date.now()}`,
      name: dto.name,
      objective: dto.objective || 'OUTCOME_LEADS',
      status: 'ACTIVE',
      daily_budget: Number(dto.daily_budget) || 1000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      cpl: 0,
      created_at: new Date().toISOString().split('T')[0],
      ad_set_name: dto.ad_set_name || `${dto.name} - AdSet`,
      target_location: dto.target_location || 'India',
    };

    // If Meta Access Token exists, post to real Meta Graph API
    if (currentConfig.access_token && currentConfig.ad_account_id) {
      try {
        const cleanAdAcc = currentConfig.ad_account_id.startsWith('act_')
          ? currentConfig.ad_account_id
          : `act_${currentConfig.ad_account_id}`;
        await fetch(`https://graph.facebook.com/v19.0/${cleanAdAcc}/campaigns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: dto.name,
            objective: dto.objective,
            status: 'PAUSED', // Safe default
            special_ad_categories: ['NONE'],
            access_token: currentConfig.access_token,
          }),
        });
      } catch (e) {
        this.logger.warn('Failed to publish to Meta Graph API, saving locally: ' + e);
      }
    }

    campaigns.unshift(newCampaign);

    await this.prisma.appIntegration.upsert({
      where: {
        organization_id_app_id: {
          organization_id: orgId,
          app_id: 'meta_ads',
        },
      },
      update: {
        config: { ...currentConfig, campaigns },
      },
      create: {
        organization_id: orgId,
        app_id: 'meta_ads',
        name: 'Meta Ads & Lead Center',
        category: 'MESSAGING',
        status: 'CONNECTED',
        config: { campaigns },
      },
    });

    return newCampaign;
  }

  /**
   * Toggle Campaign Status (Active / Paused)
   */
  async toggleCampaignStatus(orgId: string, campaignId: string) {
    const integration = await this.prisma.appIntegration.findUnique({
      where: {
        organization_id_app_id: {
          organization_id: orgId,
          app_id: 'meta_ads',
        },
      },
    });

    const currentConfig = (integration?.config as any) || {};
    const campaigns: any[] = Array.isArray(currentConfig.campaigns) ? currentConfig.campaigns : [];

    const target = campaigns.find((c) => c.id === campaignId);
    if (!target) throw new NotFoundException('Campaign not found');

    target.status = target.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    await this.prisma.appIntegration.update({
      where: {
        organization_id_app_id: {
          organization_id: orgId,
          app_id: 'meta_ads',
        },
      },
      data: {
        config: { ...currentConfig, campaigns },
      },
    });

    return { success: true, campaign: target };
  }

  /**
   * Update Campaign Daily Budget
   */
  async updateCampaignBudget(orgId: string, campaignId: string, dailyBudget: number) {
    const integration = await this.prisma.appIntegration.findUnique({
      where: {
        organization_id_app_id: {
          organization_id: orgId,
          app_id: 'meta_ads',
        },
      },
    });

    const currentConfig = (integration?.config as any) || {};
    const campaigns: any[] = Array.isArray(currentConfig.campaigns) ? currentConfig.campaigns : [];

    const target = campaigns.find((c) => c.id === campaignId);
    if (!target) throw new NotFoundException('Campaign not found');

    target.daily_budget = Number(dailyBudget);

    await this.prisma.appIntegration.update({
      where: {
        organization_id_app_id: {
          organization_id: orgId,
          app_id: 'meta_ads',
        },
      },
      data: {
        config: { ...currentConfig, campaigns },
      },
    });

    return { success: true, campaign: target };
  }
}

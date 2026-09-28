import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { MetaAdsService } from './meta-ads.service';
import { MetaOAuthService, SelectedAssetsDto } from './meta-oauth.service';
import { MetaCampaignsService, MetaCampaignDto } from './meta-campaigns.service';
import { MetaWebhookService } from './meta-webhook.service';

@Controller('meta')
export class MetaAdsController {
  constructor(
    private readonly metaAdsService: MetaAdsService,
    private readonly oauthService: MetaOAuthService,
    private readonly campaignsService: MetaCampaignsService,
    private readonly webhookService: MetaWebhookService,
  ) {}

  /**
   * Webhook Handshake Verification (GET)
   */
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: any,
  ) {
    const result = this.webhookService.verifyWebhook(mode, token, challenge);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(HttpStatus.OK).send(result);
  }

  /**
   * Webhook Event Notification Receiver (POST)
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    return this.webhookService.handleWebhook(body);
  }

  /**
   * Internal Webhook Handshake Test
   */
  @Get('webhook/test')
  async testWebhookHandshake(@Headers('x-org-id') orgId: string) {
    return this.webhookService.testWebhookHandshake(orgId || 'ORG001');
  }

  /**
   * Meta Marketing Center Overview & ROI Analytics
   */
  @Get('overview')
  async getOverview(@Headers('x-org-id') orgId: string) {
    return this.metaAdsService.getOverview(orgId || 'ORG001');
  }

  /**
   * Get Meta OAuth Authorization URL
   */
  @Get('auth/start')
  async getOAuthStart(@Headers('x-org-id') orgId: string, @Query('redirect_uri') redirectUri?: string) {
    return this.oauthService.getOAuthUrl(orgId || 'ORG001', redirectUri);
  }

  /**
   * Meta / Instagram OAuth Callback Endpoint
   */
  @Get('auth/callback')
  async handleOAuthCallback(
    @Headers('x-org-id') orgId: string,
    @Query('code') code: string,
    @Query('redirect_uri') redirectUri?: string,
  ) {
    return this.oauthService.handleOAuthCallback(code, orgId || 'ORG001', redirectUri);
  }

  /**
   * Legacy alias for OAuth URL
   */
  @Get('oauth/url')
  async getOAuthUrl(@Headers('x-org-id') orgId: string, @Query('redirect_uri') redirectUri?: string) {
    return this.oauthService.getOAuthUrl(orgId || 'ORG001', redirectUri);
  }

  /**
   * Fetch Available Meta Assets for Selection (Ad Accounts, Pages, Instagram)
   */
  @Get('assets')
  async getAvailableAssets(@Headers('x-org-id') orgId: string) {
    return this.oauthService.getAvailableAssets(orgId || 'ORG001');
  }

  /**
   * Connect / Save Selected Meta Assets
   */
  @Post('connection/select-assets')
  async saveSelectedAssets(@Headers('x-org-id') orgId: string, @Body() body: SelectedAssetsDto) {
    return this.oauthService.saveSelectedAssets(orgId || 'ORG001', body);
  }

  /**
   * Get Current Connection Status
   */
  @Get('connection')
  async getConnection(@Headers('x-org-id') orgId: string) {
    return this.oauthService.getConnection(orgId || 'ORG001');
  }

  /**
   * Disconnect Meta Account
   */
  @Post('disconnect')
  async disconnect(@Headers('x-org-id') orgId: string) {
    return this.oauthService.disconnect(orgId || 'ORG001');
  }

  /**
   * List Active Meta Campaigns
   */
  @Get('campaigns')
  async getCampaigns(@Headers('x-org-id') orgId: string) {
    return this.campaignsService.getCampaigns(orgId || 'ORG001');
  }

  /**
   * Create New Meta Campaign
   */
  @Post('campaigns')
  async createCampaign(@Headers('x-org-id') orgId: string, @Body() body: MetaCampaignDto) {
    return this.campaignsService.createCampaign(orgId || 'ORG001', body);
  }

  /**
   * Toggle Campaign (Active / Paused)
   */
  @Patch('campaigns/:id/toggle')
  async toggleCampaign(@Headers('x-org-id') orgId: string, @Param('id') id: string) {
    return this.campaignsService.toggleCampaignStatus(orgId || 'ORG001', id);
  }

  /**
   * Update Campaign Daily Budget
   */
  @Patch('campaigns/:id/budget')
  async updateBudget(
    @Headers('x-org-id') orgId: string,
    @Param('id') id: string,
    @Body('daily_budget') budget: number,
  ) {
    return this.campaignsService.updateCampaignBudget(orgId || 'ORG001', id, budget);
  }

  /**
   * List Connected Meta Instant Lead Forms
   */
  @Get('lead-forms')
  async getLeadForms(@Headers('x-org-id') orgId: string) {
    return this.metaAdsService.getLeadForms(orgId || 'ORG001');
  }

  /**
   * List Ingested Meta Leads
   */
  @Get('leads')
  async getMetaLeads(@Headers('x-org-id') orgId: string) {
    return this.metaAdsService.getMetaLeads(orgId || 'ORG001');
  }

  /**
   * Simulate a Test Lead Ingestion from Meta Ads
   */
  @Post('simulate-lead')
  async simulateLead(@Headers('x-org-id') orgId: string, @Body() body: any) {
    return this.webhookService.simulateTestLead(orgId || 'ORG001', body);
  }
}

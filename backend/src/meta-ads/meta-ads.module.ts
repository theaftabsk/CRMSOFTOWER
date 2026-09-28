import { Module } from '@nestjs/common';
import { MetaAdsController } from './meta-ads.controller';
import { MetaAdsService } from './meta-ads.service';
import { MetaOAuthService } from './meta-oauth.service';
import { MetaCampaignsService } from './meta-campaigns.service';
import { MetaWebhookService } from './meta-webhook.service';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [LeadsModule],
  controllers: [MetaAdsController],
  providers: [
    MetaAdsService,
    MetaOAuthService,
    MetaCampaignsService,
    MetaWebhookService,
  ],
  exports: [
    MetaAdsService,
    MetaOAuthService,
    MetaCampaignsService,
    MetaWebhookService,
  ],
})
export class MetaAdsModule {}


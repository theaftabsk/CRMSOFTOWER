import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { authConfig } from './config/auth.config';
import { storageConfig } from './config/storage.config';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { LeadsModule } from './leads/leads.module';
import { ContactsModule } from './contacts/contacts.module';
import { AccountsModule } from './accounts/accounts.module';
import { DealsModule } from './deals/deals.module';
import { ActivitiesModule } from './activities/activities.module';
import { ProductsModule } from './products/products.module';
import { QuotesModule } from './quotes/quotes.module';
import { OrdersModule } from './orders/orders.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FilesModule } from './files/files.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { HealthModule } from './health/health.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { PublicApiModule } from './public-api/public-api.module';
import { FormsModule } from './forms/forms.module';
import { CommunicationsModule } from './communications/communications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, storageConfig],
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    RolesModule,
    LeadsModule,
    ContactsModule,
    AccountsModule,
    DealsModule,
    ActivitiesModule,
    ProductsModule,
    QuotesModule,
    OrdersModule,
    InvoicesModule,
    PaymentsModule,
    ReportsModule,
    SearchModule,
    NotificationsModule,
    FilesModule,
    CustomFieldsModule,
    WorkflowsModule,
    AuditLogsModule,
    WebhooksModule,
    IntegrationsModule,
    SubscriptionsModule,
    HealthModule,
    ApiKeysModule,
    ExternalApiModule,
    PublicApiModule,
    FormsModule,
    CommunicationsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './leads/leads.module';
import { ContactsModule } from './contacts/contacts.module';
import { AccountsModule } from './accounts/accounts.module';
import { DealsModule } from './deals/deals.module';
import { ActivitiesModule } from './activities/activities.module';
import { FinanceModule } from './finance/finance.module';
import { SettingsModule } from './settings/settings.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    PrismaModule,
    LeadsModule,
    ContactsModule,
    AccountsModule,
    DealsModule,
    ActivitiesModule,
    FinanceModule,
    SettingsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

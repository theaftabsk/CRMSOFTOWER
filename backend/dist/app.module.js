"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const prisma_module_1 = require("./prisma/prisma.module");
const leads_module_1 = require("./leads/leads.module");
const contacts_module_1 = require("./contacts/contacts.module");
const accounts_module_1 = require("./accounts/accounts.module");
const deals_module_1 = require("./deals/deals.module");
const activities_module_1 = require("./activities/activities.module");
const finance_module_1 = require("./finance/finance.module");
const settings_module_1 = require("./settings/settings.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            leads_module_1.LeadsModule,
            contacts_module_1.ContactsModule,
            accounts_module_1.AccountsModule,
            deals_module_1.DealsModule,
            activities_module_1.ActivitiesModule,
            finance_module_1.FinanceModule,
            settings_module_1.SettingsModule,
            subscriptions_module_1.SubscriptionsModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  userLimit: number;
  features: string[];
  popular?: boolean;
}

export const saasPlans: PlanConfig[] = [
  { id: 'free', name: 'FREE', price: 0, userLimit: 2, features: ['Core Lead & Contact Manager', 'Kanban Deal Pipeline', '1 GB Storage'] },
  { id: 'starter', name: 'STARTER', price: 499, userLimit: 5, features: ['All FREE Features', 'Quotation & Invoice Builder', '5 GB Storage'] },
  { id: 'professional', name: 'PROFESSIONAL', price: 999, userLimit: 25, popular: true, features: ['All STARTER Features', 'Custom Dynamic Fields Builder', 'Audit Trail Security Logs', '25 GB Storage'] },
  { id: 'business', name: 'BUSINESS', price: 1799, userLimit: 100, features: ['All PRO Features', 'Dedicated Tenant Database', '100 GB Storage'] },
];

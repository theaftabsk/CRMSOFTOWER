export type RoleName = 'Admin' | 'Manager' | 'Sales Executive';

export type UserStatus = 'Active' | 'Inactive' | 'Invited' | 'Suspended';

export interface User {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleName;
  department: string;
  profile_photo: string;
  status: UserStatus;
  created_date: string;
  last_login: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  currency: string;
  timezone: string;
  address: string;
  created_at: string;
}

export type LeadSource = 
  | 'Website'
  | 'Facebook'
  | 'Instagram'
  | 'Google'
  | 'WhatsApp'
  | 'Referral'
  | 'Phone'
  | 'Import'
  | 'Manual'
  | 'API';

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Interested'
  | 'Not Interested'
  | 'Unqualified'
  | 'Converted'
  | 'Lost';

export type Rating = 'Hot' | 'Warm' | 'Cold';

export interface Lead {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  company: string;
  website: string;
  industry: string;
  source: LeadSource;
  status: LeadStatus;
  rating: Rating;
  owner_id: string;
  owner_name: string;
  expected_value: number;
  location: string;
  tags: string[];
  notes: string;
  next_followup_date: string;
  created_date: string;
  updated_date: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  name: string;
  phone: string;
  email: string;
  account_id: string;
  account_name: string;
  job_title: string;
  address: string;
  owner_id: string;
  owner_name: string;
  tags: string[];
  notes: string;
  created_date: string;
}

export interface Account {
  id: string;
  organization_id: string;
  name: string;
  industry: string;
  phone: string;
  email: string;
  website: string;
  annual_revenue: number;
  employee_count: number;
  owner_id: string;
  owner_name: string;
  created_date: string;
}

export type DealStage = 
  | 'New'
  | 'Contacted'
  | 'Meeting'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export interface Deal {
  id: string;
  organization_id: string;
  title: string;
  account_id: string;
  account_name: string;
  contact_id: string;
  contact_name: string;
  value: number;
  stage: DealStage;
  expected_close: string;
  owner_id: string;
  owner_name: string;
  next_followup_date: string;
  created_date: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  organization_id: string;
  title: string;
  related_entity: 'Lead' | 'Contact' | 'Deal' | 'Account';
  related_id: string;
  related_name: string;
  assigned_to: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_date: string;
}

export interface CallLog {
  id: string;
  organization_id: string;
  customer_name: string;
  customer_id: string;
  date_time: string;
  duration: string;
  result: 'Interested' | 'Not Interested' | 'No Answer' | 'Busy' | 'Follow-up Required';
  notes: string;
  logged_by: string;
}

export interface Meeting {
  id: string;
  organization_id: string;
  title: string;
  date_time: string;
  location: string;
  participants: string[];
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes: string;
}

export interface CRMNote {
  id: string;
  organization_id: string;
  entity_type: 'Lead' | 'Contact' | 'Account' | 'Deal';
  entity_id: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  description: string;
  tax_percent: number;
  status: 'Active' | 'Inactive';
}

export interface QuoteItem {
  product_id: string;
  product_name: string;
  qty: number;
  unit_price: number;
  total: number;
}

export interface Quote {
  id: string;
  organization_id: string;
  quote_number: string;
  account_id: string;
  account_name: string;
  contact_id: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  valid_until: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  created_date: string;
}

export interface SalesOrder {
  id: string;
  organization_id: string;
  order_number: string;
  quote_id: string;
  account_id: string;
  account_name: string;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Completed' | 'Cancelled';
  created_date: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  order_id: string;
  account_id: string;
  account_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  due_date: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';
  created_date: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  invoice_number: string;
  amount: number;
  method: 'Cash' | 'Bank' | 'UPI' | 'Card' | 'Online Gateway';
  transaction_date: string;
  notes: string;
}

export interface CustomField {
  id: string;
  organization_id: string;
  entity_type: 'Lead' | 'Contact' | 'Account' | 'Deal';
  field_name: string;
  field_type: 'Text' | 'Number' | 'Dropdown' | 'Date' | 'Currency';
  options?: string[];
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_value: string;
  new_value: string;
  timestamp: string;
}

export type SubscriptionPlanTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';

export interface SaaSPlan {
  tier: SubscriptionPlanTier;
  price_per_user_month: number;
  user_limit: number | 'Unlimited';
  features: string[];
}

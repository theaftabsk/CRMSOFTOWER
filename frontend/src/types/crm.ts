export type RoleName = 'Admin' | 'Manager' | 'Sales Executive';

export type UserStatus = 'Active' | 'Inactive' | 'Invited' | 'Suspended';

export interface User {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone?: string;
  role: RoleName | string;
  department?: string;
  profile_photo?: string;
  status: UserStatus | string;
  created_date?: string;
  last_login?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  currency: string;
  timezone: string;
  address?: string;
  created_at?: string;
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
  | 'API'
  | string;

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

export type LifecycleStage = 'NEW' | 'WORKING' | 'QUALIFIED' | 'CONVERTED' | 'UNQUALIFIED';
export type ActivityStatus = 'NOT_CONTACTED' | 'ATTEMPTED' | 'CONTACTED' | 'MEETING_SCHEDULED' | 'MEETING_COMPLETED';
export type QualificationStatus = 'UNQUALIFIED' | 'MQL' | 'SQL' | 'OPPORTUNITY_READY';
export type ScoreTier = 'HOT' | 'WARM' | 'COLD';
export type LeadHealth = 'EXCELLENT' | 'GOOD' | 'AT_RISK' | 'CRITICAL' | 'STALE';

export interface LeadActivity {
  id: string;
  organization_id?: string;
  lead_id: string;
  type: 'CALL' | 'EMAIL' | 'WHATSAPP' | 'MEETING' | 'NOTE' | 'TASK' | 'STAGE_CHANGE' | 'STATUS_CHANGE' | string;
  title: string;
  description?: string;
  source?: string;
  direction?: 'INBOUND' | 'OUTBOUND';
  status?: string;
  metadata?: any;
  created_at: string;
  created_by?: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone: string;
  email: string;
  company: string;
  job_title?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  linkedin_url?: string;
  source: LeadSource;
  status: LeadStatus;
  rating?: Rating;
  owner_id?: string;
  owner_name?: string;
  assigned_to?: string;
  expected_value: number;
  location?: string;
  tags?: string[];
  notes?: string;
  next_followup_date?: string;
  created_date?: string;
  updated_date?: string;

  // Enterprise Lead Intelligence Fields
  lifecycle_stage?: LifecycleStage | string;
  activity_status?: ActivityStatus | string;
  qualification_status?: QualificationStatus | string;
  fit_score?: number;
  engagement_score?: number;
  lead_score?: number;
  score_tier?: ScoreTier | string;
  lead_health?: LeadHealth | string;

  // BANT Qualification
  budget?: number;
  budget_verified?: boolean;
  authority_level?: string;
  authority_verified?: boolean;
  need?: string;
  timeline?: string;

  // AI & Next Best Action
  ai_summary?: string;
  next_best_action?: string;
  next_action_priority?: 'HIGH' | 'MEDIUM' | 'LOW' | string;

  // Activity & Cadence Tracking
  last_activity_at?: string;
  next_follow_up_date?: string;
  next_follow_up_type?: string;
  cadence_id?: string;
  cadence_step?: number;
  age_days?: number;
  inactivity_days?: number;

  // Conversion History (Salesforce 3-in-1 preservation)
  converted_at?: string;
  converted_account_id?: string;
  converted_contact_id?: string;
  converted_deal_id?: string;

  // Marketing Attribution
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  referrer_url?: string;
  unqualified_reason?: string;

  // Relational Activities
  activities?: LeadActivity[];
}

export type ContactBuyingRole = 
  | 'DECISION_MAKER'
  | 'CHAMPION'
  | 'ECONOMIC_BUYER'
  | 'INFLUENCER'
  | 'EVALUATOR'
  | 'GATEKEEPER'
  | 'BLOCKER';

export type ContactDepartment = 
  | 'EXECUTIVE'
  | 'ENGINEERING'
  | 'SALES'
  | 'MARKETING'
  | 'FINANCE'
  | 'OPERATIONS'
  | 'LEGAL'
  | 'PROCUREMENT';

export interface ContactActivity {
  id: string;
  organization_id: string;
  contact_id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'WHATSAPP' | 'NOTE' | 'TASK';
  title: string;
  description?: string;
  status?: string;
  created_at: string;
  created_by: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  designation?: string;
  city?: string;
  department?: ContactDepartment | string;
  buying_role?: ContactBuyingRole | string;
  status?: string;
  lifecycle_stage?: string;
  preferred_contact_method?: string;
  linkedin_url?: string;
  twitter_url?: string;
  last_contacted_at?: string;
  next_follow_up_date?: string;
  avatar_url?: string;
  notes?: string;
  tags?: string[];
  account_id?: string;
  account_name?: string;
  job_title?: string;
  address?: string;
  owner_id?: string;
  owner_name?: string;
  account?: {
    id: string;
    name: string;
    industry?: string;
    annual_revenue?: number;
    website?: string;
    employee_count?: number;
    billing_address?: string;
    contacts?: any[];
  };
  deals?: any[];
  activities?: ContactActivity[];
  _count?: {
    activities: number;
    deals: number;
  };
  created_date?: string;
  updated_at?: string;
}

export interface Account {
  id: string;
  organization_id: string;
  name: string;
  industry: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  country?: string;
  tier?: 'TIER_1_ENTERPRISE' | 'TIER_2_GROWTH' | 'TIER_3_SMB' | string;
  type?: 'CUSTOMER' | 'PROSPECT' | 'PARTNER' | 'VENDOR' | string;
  annual_revenue: number;
  employee_count: number;
  billing_address?: string;
  owner_id?: string;
  owner_name?: string;
  health_score?: number;
  notes?: string;
  created_date?: string;
  updated_at?: string;
  _count?: {
    contacts?: number;
    deals?: number;
    invoices?: number;
  };
  contacts?: Contact[];
  deals?: Deal[];
  invoices?: any[];
}

export type DealStage = 
  | 'New'
  | 'Contacted'
  | 'Meeting'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Qualification'
  | 'Value Proposition'
  | 'Proposal Sent'
  | 'Closed Won'
  | 'Closed Lost';

export interface Deal {
  id: string;
  organization_id: string;
  title: string;
  account_id?: string;
  account_name: string;
  contact_id?: string;
  contact_name?: string;
  value: number;
  stage: DealStage;
  expected_close?: string;
  closing_date?: string;
  owner?: string;
  owner_id?: string;
  owner_name?: string;
  probability?: number;
  pipeline_name?: string;
  lost_reason?: string;
  notes?: string;
  next_followup_date?: string;
  created_date?: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  organization_id: string;
  title: string;
  related_entity?: 'Lead' | 'Contact' | 'Deal' | 'Account';
  related_type?: string;
  related_id?: string;
  related_name?: string;
  assigned_to: string;
  due_date: string;
  priority: TaskPriority;
  status: TaskStatus;
  created_date?: string;
}

export interface CallLog {
  id: string;
  organization_id: string;
  customer_name: string;
  customer_id?: string;
  caller_user?: string;
  date_time: string;
  duration: string;
  result: string;
  notes?: string;
  logged_by?: string;
}

export type MeetingProvider = 'GOOGLE_MEET' | 'ZOOM' | 'CUSTOM' | 'OFFLINE';

export interface Meeting {
  id: string;
  organization_id: string;
  owner_id?: string;
  lead_id?: string;
  contact_id?: string;
  deal_id?: string;
  title: string;
  description?: string;
  date_time: string;
  location?: string;
  participants: string[];
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  meeting_type?: string;
  duration_minutes?: number;
  meet_link?: string;
  google_meet_url?: string;
  google_space_name?: string;
  access_type?: 'OPEN' | 'TRUSTED' | 'RESTRICTED';
  account_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  provider?: MeetingProvider;
  external_event_id?: string;
  meeting_url?: string;
  calendar_id?: string;
  organizer_email?: string;
  start_at?: string;
  end_at?: string;
  timezone?: string;
  conference_records?: any;
  transcript_text?: string;
  ai_summary?: string;
  action_items?: any;
  sync_status?: 'SYNCED' | 'LOCAL_ONLY' | 'FAILED' | 'LOCAL_READY';
  created_at?: string;
  updated_at?: string;
}

export interface CalendarIntegration {
  id: string | null;
  provider: 'GOOGLE' | 'ZOOM' | 'MICROSOFT';
  account_email?: string | null;
  calendar_id: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  connected: boolean;
  updated_at?: string | null;
}

export interface Product {
  id: string;
  organization_id: string;
  code?: string;
  sku?: string;
  name: string;
  category: string;
  price?: number;
  unit_price?: number;
  stock?: number;
  description?: string;
  tax_percent?: number;
  gst_rate_percent?: number;
  status?: 'Active' | 'Inactive';
}

export interface QuoteItem {
  product_id?: string;
  product_name: string;
  qty: number;
  unit_price: number;
  total: number;
}

export interface Quote {
  id: string;
  organization_id: string;
  quote_number: string;
  account_id?: string;
  account_name: string;
  contact_id?: string;
  items?: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  valid_until?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  created_date?: string;
}

export interface SalesOrder {
  id: string;
  organization_id: string;
  order_number: string;
  quote_id?: string;
  account_id?: string;
  account_name: string;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Completed' | 'Cancelled';
  created_date?: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  invoice_number: string;
  order_id?: string;
  account_id?: string;
  account_name: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  due_date: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled' | 'Unpaid' | 'Partial';
  created_date?: string;
  issue_date?: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  invoice_id?: string;
  invoice_number?: string;
  payment_number?: string;
  amount: number;
  method: 'Cash' | 'Bank' | 'UPI' | 'Card' | 'Online Gateway' | string;
  transaction_date?: string;
  payment_date?: string;
  notes?: string;
}

export interface CustomField {
  id: string;
  organization_id: string;
  entity_type: 'Lead' | 'Contact' | 'Account' | 'Deal';
  field_name: string;
  field_type: 'Text' | 'Number' | 'Dropdown' | 'Date' | 'Currency';
  options?: string[];
  created_at?: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_value?: string;
  new_value?: string;
  timestamp: string;
}

export type SubscriptionPlanTier = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';

export interface SaaSPlan {
  tier: SubscriptionPlanTier;
  price_per_user_month: number;
  user_limit: number | 'Unlimited';
  features: string[];
}

// Enterprise Web Forms & Lead Capture Experience Types
export type FormFieldCategory = 'basic' | 'choice' | 'business' | 'advanced';
export type FormFieldType = 
  | 'text' | 'textarea' | 'email' | 'tel' | 'number' | 'url'
  | 'select' | 'radio' | 'checkbox' | 'rating'
  | 'company' | 'job_title' | 'industry' | 'city' | 'budget' | 'date'
  | 'file' | 'hidden' | 'consent';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface WebFormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  description?: string;
  help_text?: string;
  default_value?: any;
  options?: FormFieldOption[];
  min?: number;
  max?: number;
  mapping?: string; // e.g. Lead.name, Lead.email, Lead.expected_value
  validation_regex?: string;
  step?: number;
}

export interface WebFormTheme {
  preset: 'minimal_monochrome' | 'dark_obsidian' | 'corporate_cobalt' | 'clean_emerald' | 'warm_slate' | string;
  layout: 'classic' | 'conversational' | 'multi_step';
  font: string;
  primary_color: string;
  background_color: string;
  surface_color: string;
  border_color: string;
  radius: string;
  button_radius: string;
  show_logo: boolean;
  logo_url?: string;
  custom_css?: string;
}

export interface WebFormLogicRule {
  id: string;
  field_id: string;
  condition: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'IS_FILLED';
  value: string;
  action: 'SHOW' | 'HIDE' | 'REQUIRE';
  target_field_id: string;
}

export interface WebFormSettings {
  auto_create_lead: boolean;
  assigned_to: string;
  routing_strategy: 'SPECIFIC_REP' | 'ROUND_ROBIN';
  default_lead_status: string;
  default_lifecycle_stage: string;
  lead_score_bonus: number;
  notify_email?: string;
  send_notification_email: boolean;
  auto_responder: boolean;
  auto_responder_subject?: string;
  auto_responder_body?: string;
  enable_honeypot: boolean;
  enable_rate_limit: boolean;
  success_action: 'THANK_YOU' | 'REDIRECT' | 'BOOK_MEETING';
  redirect_url?: string;
}

export interface WebFormSubmission {
  id: string;
  form_id: string;
  lead_id?: string;
  payload: Record<string, any>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  ip_address?: string;
  user_agent?: string;
  duration_seconds?: number;
  created_at: string;
}

export interface WebForm {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  layout: 'classic' | 'conversational' | 'multi_step';
  status: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED';
  version: number;
  fields: WebFormField[];
  steps?: { id: number; title: string; description?: string }[];
  logic?: WebFormLogicRule[];
  theme: WebFormTheme;
  settings: WebFormSettings;
  submit_btn_text: string;
  success_message: string;
  redirect_url?: string;
  is_active: boolean;
  is_preview?: boolean;
  views_count: number;
  starts_count: number;
  submissions_count: number;
  conversion_rate?: number;
  created_at: string;
  updated_at: string;
  submissions?: WebFormSubmission[];
  _count?: {
    submissions: number;
  };
}


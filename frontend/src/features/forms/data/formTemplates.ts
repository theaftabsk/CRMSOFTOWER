import { WebFormField, WebFormTheme, WebFormSettings } from '@/types/crm';

export interface FormTemplate {
  id: string;
  name: string;
  category: 'Lead Generation' | 'Sales' | 'Feedback' | 'Operations';
  description: string;
  layout: 'classic' | 'conversational' | 'multi_step';
  fields: WebFormField[];
  theme: Partial<WebFormTheme>;
  settings: Partial<WebFormSettings>;
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'tpl_contact_sales',
    name: 'Contact Sales & Enterprise Inquiry',
    category: 'Sales',
    description: 'Standard enterprise contact form with name, work email, phone, company, budget, and requirements.',
    layout: 'classic',
    fields: [
      { id: 'fld_1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Rajesh Sharma', mapping: 'Lead.name' },
      { id: 'fld_2', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'rajesh@company.com', mapping: 'Lead.email' },
      { id: 'fld_3', name: 'phone', label: 'Direct Phone Number', type: 'tel', required: true, placeholder: '+91 98765 43210', mapping: 'Lead.phone' },
      { id: 'fld_4', name: 'company', label: 'Company / Organization', type: 'company', required: true, placeholder: 'Acme Technologies', mapping: 'Lead.company' },
      { id: 'fld_5', name: 'budget', label: 'Expected Budget (₹)', type: 'budget', required: false, placeholder: '100000', mapping: 'Lead.expected_value' },
      { id: 'fld_6', name: 'notes', label: 'Project Requirements & Scope', type: 'textarea', required: false, placeholder: 'Tell us about your team and software requirements...', mapping: 'Lead.notes' },
    ],
    theme: {
      preset: 'minimal_monochrome',
      primary_color: '#111111',
      background_color: '#FFFFFF',
      font: 'Inter',
      radius: '12px',
      button_radius: '8px',
    },
    settings: {
      auto_create_lead: true,
      default_lifecycle_stage: 'WORKING',
      lead_score_bonus: 25,
      success_action: 'THANK_YOU',
    },
  },
  {
    id: 'tpl_book_demo',
    name: 'Conversational Demo Request (Typeform Style)',
    category: 'Lead Generation',
    description: '1-question-at-a-time conversational experience with high conversion rates for software demos.',
    layout: 'conversational',
    fields: [
      { id: 'fld_1', name: 'name', label: 'What is your full name?', type: 'text', required: true, placeholder: 'Your Name', mapping: 'Lead.name' },
      { id: 'fld_2', name: 'email', label: 'What is your corporate email?', type: 'email', required: true, placeholder: 'name@company.com', mapping: 'Lead.email' },
      { id: 'fld_3', name: 'company', label: 'Which company do you represent?', type: 'company', required: true, placeholder: 'Company Name', mapping: 'Lead.company' },
      { id: 'fld_4', name: 'phone', label: 'What is the best phone number to reach you?', type: 'tel', required: true, placeholder: '+91 ...', mapping: 'Lead.phone' },
      { id: 'fld_5', name: 'team_size', label: 'How many team members will use the platform?', type: 'select', required: true, options: [
        { label: '1 - 10 Users', value: '1-10' },
        { label: '11 - 50 Users', value: '11-50' },
        { label: '50 - 250 Users', value: '50-250' },
        { label: '250+ Enterprise Users', value: '250+' },
      ]},
    ],
    theme: {
      preset: 'minimal_monochrome',
      primary_color: '#111111',
      background_color: '#FFFFFF',
      font: 'Inter',
      radius: '16px',
      button_radius: '10px',
    },
    settings: {
      auto_create_lead: true,
      default_lifecycle_stage: 'QUALIFIED',
      lead_score_bonus: 30,
      success_action: 'BOOK_MEETING',
    },
  },
  {
    id: 'tpl_quote_request',
    name: 'Request a Quote / Pricing Estimation',
    category: 'Sales',
    description: 'Detailed proposal request capturing specific module requirements and timeline.',
    layout: 'classic',
    fields: [
      { id: 'fld_1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Name', mapping: 'Lead.name' },
      { id: 'fld_2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'email@domain.com', mapping: 'Lead.email' },
      { id: 'fld_3', name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+91 ...', mapping: 'Lead.phone' },
      { id: 'fld_4', name: 'company', label: 'Organization', type: 'company', required: true, placeholder: 'Org Name', mapping: 'Lead.company' },
      { id: 'fld_5', name: 'industry', label: 'Industry Vertical', type: 'select', required: true, options: [
        { label: 'Information Technology', value: 'Technology' },
        { label: 'Manufacturing & Industrial', value: 'Manufacturing' },
        { label: 'Healthcare & Life Sciences', value: 'Healthcare' },
        { label: 'Finance & Banking', value: 'Finance' },
        { label: 'Education & Academics', value: 'Education' },
      ], mapping: 'Lead.industry' },
      { id: 'fld_6', name: 'budget', label: 'Target Investment Budget (₹)', type: 'budget', required: true, placeholder: '₹1,50,000', mapping: 'Lead.expected_value' },
      { id: 'fld_7', name: 'notes', label: 'Deliverable Expectations', type: 'textarea', required: false, placeholder: 'Key modules and integrations needed...', mapping: 'Lead.notes' },
    ],
    theme: {
      preset: 'corporate_cobalt',
      primary_color: '#2563EB',
      background_color: '#FFFFFF',
      font: 'Plus Jakarta Sans',
      radius: '12px',
      button_radius: '8px',
    },
    settings: {
      auto_create_lead: true,
      default_lifecycle_stage: 'WORKING',
      lead_score_bonus: 25,
      success_action: 'THANK_YOU',
    },
  },
  {
    id: 'tpl_customer_feedback',
    name: 'Customer Feedback & CSAT Survey',
    category: 'Feedback',
    description: 'Capture Net Promoter Score (NPS), star rating, and product feedback.',
    layout: 'conversational',
    fields: [
      { id: 'fld_1', name: 'name', label: 'Your Name (Optional)', type: 'text', required: false, placeholder: 'Anonymous or Name' },
      { id: 'fld_2', name: 'rating', label: 'How satisfied are you with our CRM software?', type: 'rating', required: true },
      { id: 'fld_3', name: 'recommend', label: 'How likely are you to recommend us to a colleague?', type: 'select', required: true, options: [
        { label: '10 - Extremely Likely', value: '10' },
        { label: '9 - Very Likely', value: '9' },
        { label: '7-8 - Somewhat Likely', value: '8' },
        { label: 'Below 6 - Unlikely', value: '5' },
      ]},
      { id: 'fld_4', name: 'message', label: 'What could we improve?', type: 'textarea', required: false, placeholder: 'Share your suggestions...' },
    ],
    theme: {
      preset: 'clean_emerald',
      primary_color: '#16A34A',
      background_color: '#FFFFFF',
      font: 'Inter',
      radius: '14px',
      button_radius: '8px',
    },
    settings: {
      auto_create_lead: false,
      success_action: 'THANK_YOU',
    },
  },
  {
    id: 'tpl_partner_application',
    name: 'Partner & Reseller Application',
    category: 'Operations',
    description: 'Onboard implementation partners, agencies, and software resellers.',
    layout: 'classic',
    fields: [
      { id: 'fld_1', name: 'name', label: 'Principal Contact Name', type: 'text', required: true, placeholder: 'Full Name', mapping: 'Lead.name' },
      { id: 'fld_2', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'partner@agency.com', mapping: 'Lead.email' },
      { id: 'fld_3', name: 'phone', label: 'Direct Phone', type: 'tel', required: true, placeholder: '+91 ...', mapping: 'Lead.phone' },
      { id: 'fld_4', name: 'company', label: 'Agency / Firm Name', type: 'company', required: true, placeholder: 'Agency Ltd', mapping: 'Lead.company' },
      { id: 'fld_5', name: 'city', label: 'Headquarters City', type: 'text', required: true, placeholder: 'e.g. Bangalore', mapping: 'Lead.city' },
      { id: 'fld_6', name: 'notes', label: 'Current Client Portfolio & Focus', type: 'textarea', required: false, placeholder: 'How many clients do you service monthly?', mapping: 'Lead.notes' },
    ],
    theme: {
      preset: 'dark_obsidian',
      primary_color: '#111111',
      background_color: '#FFFFFF',
      font: 'Inter',
      radius: '12px',
      button_radius: '8px',
    },
    settings: {
      auto_create_lead: true,
      default_lifecycle_stage: 'WORKING',
      lead_score_bonus: 20,
      success_action: 'THANK_YOU',
    },
  },
];

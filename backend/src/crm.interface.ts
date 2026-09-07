export interface LeadDto {
  id?: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  company: string;
  website?: string;
  industry?: string;
  source: string;
  status: string;
  rating: string;
  owner_id: string;
  owner_name: string;
  expected_value: number;
  location?: string;
  tags?: string[];
  notes?: string;
  next_followup_date?: string;
}

export interface ConvertLeadDto {
  leadId: string;
  createDeal: boolean;
  dealValue?: number;
  dealTitle?: string;
}

export interface DealDto {
  id?: string;
  organization_id: string;
  title: string;
  account_id: string;
  account_name: string;
  contact_id: string;
  contact_name: string;
  value: number;
  stage: string;
  expected_close: string;
  owner_id: string;
  owner_name: string;
}

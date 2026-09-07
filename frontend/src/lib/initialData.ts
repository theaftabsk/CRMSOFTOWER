import { 
  Organization, User, Lead, Contact, Account, Deal, Task, 
  CallLog, Meeting, Product, Quote, Invoice, Payment, CustomField, AuditLog, SaaSPlan 
} from '../types/crm';

export const initialOrganization: Organization = {
  id: 'ORG001',
  name: 'ABC Technologies',
  logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
  currency: '₹',
  timezone: 'Asia/Kolkata',
  address: '123 Innovation Tech Park, Suite 402, City Hub',
  created_at: '2026-01-15'
};

export const initialUsers: User[] = [
  {
    id: 'USR001',
    organization_id: 'ORG001',
    name: 'Aftab Admin',
    email: 'admin@abctechnologies.com',
    phone: '+91 9876543210',
    role: 'Admin',
    department: 'Executive Management',
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    status: 'Active',
    created_date: '2026-01-15',
    last_login: '2026-09-06 11:30 AM'
  },
  {
    id: 'USR002',
    organization_id: 'ORG001',
    name: 'Vikram Sales Manager',
    email: 'vikram@abctechnologies.com',
    phone: '+91 9876543211',
    role: 'Manager',
    department: 'Sales & Growth',
    profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    status: 'Active',
    created_date: '2026-02-01',
    last_login: '2026-09-06 10:15 AM'
  },
  {
    id: 'USR003',
    organization_id: 'ORG001',
    name: 'Sales Executive 1 (Rohan)',
    email: 'rohan@abctechnologies.com',
    phone: '+91 9876543212',
    role: 'Sales Executive',
    department: 'Sales',
    profile_photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    status: 'Active',
    created_date: '2026-02-10',
    last_login: '2026-09-06 09:45 AM'
  },
  {
    id: 'USR004',
    organization_id: 'ORG001',
    name: 'Sales Executive 2 (Priya)',
    email: 'priya@abctechnologies.com',
    phone: '+91 9876543213',
    role: 'Sales Executive',
    department: 'Sales',
    profile_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    status: 'Active',
    created_date: '2026-03-01',
    last_login: '2026-09-05 04:20 PM'
  }
];

export const initialLeads: Lead[] = [
  {
    id: 'LED001',
    organization_id: 'ORG001',
    first_name: 'Rahul',
    last_name: 'Sharma',
    phone: '9876512340',
    email: 'rahul@abcschool.edu.in',
    company: 'ABC School',
    website: 'https://abcschool.edu.in',
    industry: 'Education',
    source: 'Website',
    status: 'Interested',
    rating: 'Hot',
    owner_id: 'USR003',
    owner_name: 'Sales Executive 1 (Rohan)',
    expected_value: 50000,
    location: 'Kolkata, WB',
    tags: ['VIP', 'Website', 'School'],
    notes: 'Customer wants complete ERP website and student portal within ₹50,000 budget.',
    next_followup_date: '2026-09-10T11:00',
    created_date: '2026-09-01',
    updated_date: '2026-09-06'
  },
  {
    id: 'LED002',
    organization_id: 'ORG001',
    first_name: 'Amit',
    last_name: 'Patel',
    phone: '9812345678',
    email: 'amit@technosolutions.com',
    company: 'Techno Solutions',
    website: 'https://technosolutions.com',
    industry: 'Information Technology',
    source: 'Facebook',
    status: 'Contacted',
    rating: 'Warm',
    owner_id: 'USR004',
    owner_name: 'Sales Executive 2 (Priya)',
    expected_value: 120000,
    location: 'Mumbai, MH',
    tags: ['High Value', 'Facebook'],
    notes: 'Interested in custom CRM Software implementation for 25 staff members.',
    next_followup_date: '2026-09-08T14:30',
    created_date: '2026-09-02',
    updated_date: '2026-09-05'
  },
  {
    id: 'LED003',
    organization_id: 'ORG001',
    first_name: 'Suman',
    last_name: 'Roy',
    phone: '9734567890',
    email: 'suman@apexgroup.co.in',
    company: 'Apex Group',
    website: 'https://apexgroup.co.in',
    industry: 'Manufacturing',
    source: 'Google',
    status: 'Qualified',
    rating: 'Hot',
    owner_id: 'USR003',
    owner_name: 'Sales Executive 1 (Rohan)',
    expected_value: 250000,
    location: 'Bangalore, KA',
    tags: ['Hot', 'High Value', 'Google'],
    notes: 'Requires SEO package & Web ERP system integration.',
    next_followup_date: '2026-09-07T16:00',
    created_date: '2026-09-03',
    updated_date: '2026-09-06'
  },
  {
    id: 'LED004',
    organization_id: 'ORG001',
    first_name: 'Neha',
    last_name: 'Gupta',
    phone: '9988776655',
    email: 'neha@fashionhub.com',
    company: 'Fashion Hub',
    website: 'https://fashionhub.com',
    industry: 'E-commerce',
    source: 'Instagram',
    status: 'New',
    rating: 'Warm',
    owner_id: 'USR004',
    owner_name: 'Sales Executive 2 (Priya)',
    expected_value: 75000,
    location: 'Delhi, NCR',
    tags: ['Instagram', 'E-commerce'],
    notes: 'Inquired about social media marketing and website design.',
    next_followup_date: '2026-09-09T10:00',
    created_date: '2026-09-05',
    updated_date: '2026-09-05'
  }
];

export const initialAccounts: Account[] = [
  {
    id: 'ACC001',
    organization_id: 'ORG001',
    name: 'ABC School',
    industry: 'Education',
    phone: '033-24556677',
    email: 'info@abcschool.edu.in',
    website: 'https://abcschool.edu.in',
    annual_revenue: 5000000,
    employee_count: 85,
    owner_id: 'USR003',
    owner_name: 'Sales Executive 1 (Rohan)',
    created_date: '2026-08-15'
  },
  {
    id: 'ACC002',
    organization_id: 'ORG001',
    name: 'Techno Solutions',
    industry: 'Information Technology',
    phone: '022-88776655',
    email: 'contact@technosolutions.com',
    website: 'https://technosolutions.com',
    annual_revenue: 25000000,
    employee_count: 140,
    owner_id: 'USR004',
    owner_name: 'Sales Executive 2 (Priya)',
    created_date: '2026-08-20'
  }
];

export const initialContacts: Contact[] = [
  {
    id: 'CON001',
    organization_id: 'ORG001',
    name: 'Rahul Sharma',
    phone: '9876512340',
    email: 'rahul@abcschool.edu.in',
    account_id: 'ACC001',
    account_name: 'ABC School',
    job_title: 'Principal & Director',
    address: '45 Park Street, Kolkata',
    owner_id: 'USR003',
    owner_name: 'Sales Executive 1 (Rohan)',
    tags: ['Principal', 'Decision Maker'],
    notes: 'Primary contact for IT overhaul and school software.',
    created_date: '2026-08-15'
  },
  {
    id: 'CON002',
    organization_id: 'ORG001',
    name: 'Amit Kumar',
    phone: '9876512341',
    email: 'amit.fin@abcschool.edu.in',
    account_id: 'ACC001',
    account_name: 'ABC School',
    job_title: 'Chief Accountant',
    address: '45 Park Street, Kolkata',
    owner_id: 'USR003',
    owner_name: 'Sales Executive 1 (Rohan)',
    tags: ['Finance', 'Accounts'],
    notes: 'Handles billing, PO approvals, and payments.',
    created_date: '2026-08-18'
  }
];

export const initialDeals: Deal[] = [
  {
    id: 'DL001',
    organization_id: 'ORG001',
    title: 'ABC School Website Development',
    account_id: 'ACC001',
    account_name: 'ABC School',
    contact_id: 'CON001',
    contact_name: 'Rahul Sharma',
    value: 50000,
    stage: 'Proposal',
    expected_close: '2026-09-20',
    owner_id: 'USR003',
    owner_name: 'Sales Executive 1 (Rohan)',
    next_followup_date: '2026-09-10T11:00',
    created_date: '2026-08-25'
  },
  {
    id: 'DL002',
    organization_id: 'ORG001',
    title: 'Techno Solutions CRM Software',
    account_id: 'ACC002',
    account_name: 'Techno Solutions',
    contact_id: 'CON003',
    contact_name: 'Amit Patel',
    value: 150000,
    stage: 'Negotiation',
    expected_close: '2026-09-25',
    owner_id: 'USR004',
    owner_name: 'Sales Executive 2 (Priya)',
    next_followup_date: '2026-09-08T14:00',
    created_date: '2026-08-28'
  },
  {
    id: 'DL003',
    organization_id: 'ORG001',
    title: 'SEO & Digital Marketing Package',
    account_id: 'ACC001',
    account_name: 'ABC School',
    contact_id: 'CON001',
    contact_name: 'Rahul Sharma',
    value: 35000,
    stage: 'Won',
    expected_close: '2026-09-01',
    owner_id: 'USR003',
    owner_name: 'Sales Executive 1 (Rohan)',
    next_followup_date: '',
    created_date: '2026-08-10'
  }
];

export const initialTasks: Task[] = [
  {
    id: 'TSK001',
    organization_id: 'ORG001',
    title: 'Call ABC School Principal regarding quotation',
    related_entity: 'Lead',
    related_id: 'LED001',
    related_name: 'Rahul Sharma (ABC School)',
    assigned_to: 'Sales Executive 1 (Rohan)',
    due_date: '2026-09-10',
    priority: 'High',
    status: 'Pending',
    created_date: '2026-09-05'
  },
  {
    id: 'TSK002',
    organization_id: 'ORG001',
    title: 'Send Revised Proposal to Techno Solutions',
    related_entity: 'Deal',
    related_id: 'DL002',
    related_name: 'Techno Solutions CRM Software',
    assigned_to: 'Sales Executive 2 (Priya)',
    due_date: '2026-09-08',
    priority: 'Urgent',
    status: 'In Progress',
    created_date: '2026-09-06'
  }
];

export const initialCalls: CallLog[] = [
  {
    id: 'CAL001',
    organization_id: 'ORG001',
    customer_name: 'Rahul Sharma',
    customer_id: 'LED001',
    date_time: '2026-09-06 10:30 AM',
    duration: '12 min',
    result: 'Interested',
    notes: 'Discussed website requirements. Customer requested custom quote within ₹50,000.',
    logged_by: 'Sales Executive 1 (Rohan)'
  }
];

export const initialMeetings: Meeting[] = [
  {
    id: 'MTG001',
    organization_id: 'ORG001',
    title: 'ABC School Demo & Requirement Gathering',
    date_time: '2026-09-10 11:00 AM',
    location: 'Google Meet / ABC School Office',
    participants: ['Rahul Sharma', 'Amit Kumar', 'Rohan (Sales Exec)'],
    status: 'Scheduled',
    notes: 'Live demo of CRM Software & ERP system.'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'PRD001',
    organization_id: 'ORG001',
    name: 'Website Development',
    sku: 'SKU-WEB-01',
    category: 'Development',
    price: 40000,
    description: 'Custom responsive web application design & coding.',
    tax_percent: 18,
    status: 'Active'
  },
  {
    id: 'PRD002',
    organization_id: 'ORG001',
    name: 'Cloud Hosting & Domain (1 Year)',
    sku: 'SKU-HOST-01',
    category: 'Infrastructure',
    price: 5000,
    description: 'High-speed NVMe cloud server hosting with SSL.',
    tax_percent: 18,
    status: 'Active'
  },
  {
    id: 'PRD003',
    organization_id: 'ORG001',
    name: 'Annual Maintenance Contract (AMC)',
    sku: 'SKU-AMC-01',
    category: 'Service',
    price: 5000,
    description: '24/7 technical support & security updates.',
    tax_percent: 18,
    status: 'Active'
  },
  {
    id: 'PRD004',
    organization_id: 'ORG001',
    name: 'CRM Software License',
    sku: 'SKU-CRM-01',
    category: 'Software',
    price: 50000,
    description: 'Multi-tenant SaaS CRM core platform.',
    tax_percent: 18,
    status: 'Active'
  }
];

export const initialQuotes: Quote[] = [
  {
    id: 'QTE1001',
    organization_id: 'ORG001',
    quote_number: 'QT-2026-1001',
    account_id: 'ACC001',
    account_name: 'ABC School',
    contact_id: 'CON001',
    items: [
      { product_id: 'PRD001', product_name: 'Website Development', qty: 1, unit_price: 40000, total: 40000 },
      { product_id: 'PRD002', product_name: 'Cloud Hosting & Domain (1 Year)', qty: 1, unit_price: 5000, total: 5000 },
      { product_id: 'PRD003', product_name: 'Annual Maintenance Contract (AMC)', qty: 1, unit_price: 5000, total: 5000 }
    ],
    subtotal: 50000,
    tax: 9000,
    total: 59000,
    valid_until: '2026-09-30',
    status: 'Sent',
    created_date: '2026-09-06'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'INV1001',
    organization_id: 'ORG001',
    invoice_number: 'INV-1001',
    order_id: 'ORD-1001',
    account_id: 'ACC001',
    account_name: 'ABC School',
    total_amount: 59000,
    paid_amount: 30000,
    due_amount: 29000,
    due_date: '2026-09-25',
    status: 'Partially Paid',
    created_date: '2026-09-06'
  }
];

export const initialPayments: Payment[] = [
  {
    id: 'PAY001',
    organization_id: 'ORG001',
    invoice_number: 'INV-1001',
    amount: 30000,
    method: 'UPI',
    transaction_date: '2026-09-06 11:20 AM',
    notes: 'Advance 50% payment received via GPay/UPI.'
  }
];

export const initialCustomFields: CustomField[] = [
  {
    id: 'CF001',
    organization_id: 'ORG001',
    entity_type: 'Lead',
    field_name: 'Target Budget',
    field_type: 'Currency'
  },
  {
    id: 'CF002',
    organization_id: 'ORG001',
    entity_type: 'Lead',
    field_name: 'Interested Service',
    field_type: 'Dropdown',
    options: ['Website Development', 'SEO Package', 'CRM Software', 'Mobile App']
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'LOG001',
    organization_id: 'ORG001',
    user_name: 'Aftab Admin',
    action: 'Changed Deal Value',
    entity_type: 'Deal',
    entity_id: 'DL001',
    previous_value: '₹40,000',
    new_value: '₹50,000',
    timestamp: '2026-09-06 11:15 AM'
  },
  {
    id: 'LOG002',
    organization_id: 'ORG001',
    user_name: 'Sales Executive 1 (Rohan)',
    action: 'Updated Lead Status',
    entity_type: 'Lead',
    entity_id: 'LED001',
    previous_value: 'Contacted',
    new_value: 'Interested',
    timestamp: '2026-09-06 10:45 AM'
  }
];

export const saasPricingPlans: SaaSPlan[] = [
  {
    tier: 'FREE',
    price_per_user_month: 0,
    user_limit: 3,
    features: ['Basic Leads', 'Contacts', 'Deals', 'Tasks', 'Basic Dashboard']
  },
  {
    tier: 'STARTER',
    price_per_user_month: 499,
    user_limit: 10,
    features: ['Leads', 'Contacts', 'Accounts', 'Deals', 'Pipeline', 'Tasks', 'Calls', 'Meetings', 'Basic Reports']
  },
  {
    tier: 'PROFESSIONAL',
    price_per_user_month: 999,
    user_limit: 25,
    features: ['Everything in Starter', 'Advanced Reports', 'Automation', 'Email', 'Custom Fields', 'Custom Views', 'Quotes', 'Orders', 'Invoices']
  },
  {
    tier: 'BUSINESS',
    price_per_user_month: 1799,
    user_limit: 100,
    features: ['Everything in Professional', 'Advanced Permissions', 'Advanced Analytics', 'API', 'Webhooks', 'Customer Portal', 'Advanced customization']
  },
  {
    tier: 'ENTERPRISE',
    price_per_user_month: 2999,
    user_limit: 'Unlimited',
    features: ['SSO', 'Advanced Security', 'Dedicated infrastructure', 'Custom development', 'SLA', 'Enterprise support']
  }
];

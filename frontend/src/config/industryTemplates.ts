export interface PipelineStageConfig {
  id: number;
  name: string;
  probability: number;
  color?: string;
  description?: string;
}

export interface CustomFieldConfig {
  entity_type: 'Lead' | 'Deal' | 'Account' | 'Contact';
  field_name: string;
  field_type: 'Text' | 'Number' | 'Currency' | 'Dropdown' | 'Date';
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface SampleDealConfig {
  title: string;
  account_name: string;
  value: number;
  stage: string;
  probability: number;
}

export interface IndustryVerticalConfig {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  badge: string;
  dealTerminology: string;     // Singular e.g. "Property Booking"
  dealsTerminology: string;    // Plural e.g. "Property Bookings"
  leadTerminology: string;     // e.g. "Property Inquiry"
  targetMonthlyRevenue: string; // e.g. "₹50,00,000"
  pipelineStages: PipelineStageConfig[];
  customFields: CustomFieldConfig[];
  quickFormTitle: string;
  quickFormFields: string[];
  sampleDeals: SampleDealConfig[];
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryVerticalConfig> = {
  real_estate: {
    id: 'real_estate',
    name: 'Real Estate & Properties',
    tagline: 'Brokers, Builders & Commercial Developers',
    iconName: 'Building2',
    badge: 'High Value',
    dealTerminology: 'Property Booking',
    dealsTerminology: 'Property Bookings',
    leadTerminology: 'Property Inquiry',
    targetMonthlyRevenue: '₹50,00,000',
    pipelineStages: [
      { id: 1, name: 'New Property Inquiry', probability: 15, description: 'Incoming lead from portal or ad' },
      { id: 2, name: 'Budget & Location Verified', probability: 35, description: 'Verified configuration & affordability' },
      { id: 3, name: 'Site Visit Scheduled', probability: 60, description: 'VIP cab / physical project inspection' },
      { id: 4, name: 'Token Advance Received', probability: 85, description: 'Booking amount deposited for unit' },
      { id: 5, name: 'Agreement & Registry Completed', probability: 100, description: 'Registration & commission won' },
    ],
    customFields: [
      {
        entity_type: 'Lead',
        field_name: 'Property Configuration',
        field_type: 'Dropdown',
        options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK Luxury', 'Commercial Shop', 'Plot / Land'],
      },
      {
        entity_type: 'Lead',
        field_name: 'Budget Band',
        field_type: 'Dropdown',
        options: ['Under ₹30 Lakhs', '₹30L - ₹60L', '₹60L - ₹1.2 Crore', 'Above ₹1.2 Crore'],
      },
      {
        entity_type: 'Deal',
        field_name: 'Unit / Flat Number',
        field_type: 'Text',
        placeholder: 'Tower B - Flat 402',
      },
      {
        entity_type: 'Deal',
        field_name: 'Site Visit Date',
        field_type: 'Date',
      },
    ],
    quickFormTitle: 'Schedule a Free VIP Project Site Visit',
    quickFormFields: ['Full Name', 'WhatsApp Number', 'Preferred Configuration (2BHK/3BHK)', 'Planned Visit Date'],
    sampleDeals: [
      { title: 'Tower C - 3BHK Penthouse Booking', account_name: 'Rajesh & Sonali Verma', value: 8500000, stage: 'Token Advance Received', probability: 85 },
      { title: 'Commercial Retail Shop #12', account_name: 'Metro Retailers Pvt Ltd', value: 4200000, stage: 'Site Visit Scheduled', probability: 60 },
    ],
  },

  travel_tourism: {
    id: 'travel_tourism',
    name: 'Tours & Travel Agency',
    tagline: 'Holiday Packages, Corporate & Visa Services',
    iconName: 'Compass',
    badge: 'Fast Turnover',
    dealTerminology: 'Trip Package',
    dealsTerminology: 'Trip Packages',
    leadTerminology: 'Travel Enquiry',
    targetMonthlyRevenue: '₹18,00,000',
    pipelineStages: [
      { id: 1, name: 'New Trip Inquiry', probability: 20, description: 'Destination and travel dates enquired' },
      { id: 2, name: 'Custom Itinerary Shared', probability: 45, description: 'Day-by-day plan & hotel quotation sent' },
      { id: 3, name: 'Flights & Hotel Blocked', probability: 70, description: 'Rooms and flights held with vendor' },
      { id: 4, name: 'Deposit Received', probability: 90, description: '50% package advance deposited' },
      { id: 5, name: 'Tickets & Vouchers Issued', probability: 100, description: 'Full payment received & trip booked' },
    ],
    customFields: [
      {
        entity_type: 'Lead',
        field_name: 'Holiday Destination',
        field_type: 'Text',
        placeholder: 'e.g. Dubai, Bali, Kashmir, Switzerland',
      },
      {
        entity_type: 'Lead',
        field_name: 'Number of Travelers (Pax)',
        field_type: 'Number',
        placeholder: '2 Adults, 1 Child',
      },
      {
        entity_type: 'Deal',
        field_name: 'Travel Departure Date',
        field_type: 'Date',
      },
      {
        entity_type: 'Deal',
        field_name: 'Hotel Rating',
        field_type: 'Dropdown',
        options: ['3-Star Standard', '4-Star Premium', '5-Star Luxury', 'Private Villa'],
      },
    ],
    quickFormTitle: 'Request a Custom Holiday Itinerary & Quote',
    quickFormFields: ['Lead Traveler Name', 'Phone Number', 'Destination', 'Month of Travel', 'Adults Count'],
    sampleDeals: [
      { title: '6N/7D Luxury Dubai & Desert Safari', account_name: 'Amitabh Sharma Family', value: 245000, stage: 'Deposit Received', probability: 90 },
      { title: 'Bali 5N Romantic Getaway Package', account_name: 'Pooja & Rohan Sen', value: 168000, stage: 'Custom Itinerary Shared', probability: 45 },
    ],
  },

  education: {
    id: 'education',
    name: 'School, College & EdTech',
    tagline: 'Private Schools, Coaching & Degree Institutes',
    iconName: 'GraduationCap',
    badge: 'Seasonal Surge',
    dealTerminology: 'Student Admission',
    dealsTerminology: 'Student Admissions',
    leadTerminology: 'Admission Enquiry',
    targetMonthlyRevenue: '₹35,00,000',
    pipelineStages: [
      { id: 1, name: 'Admission Enquiry', probability: 20, description: 'Prospect parent/student application' },
      { id: 2, name: 'Tele-Counseling Completed', probability: 40, description: 'Course match & eligibility verified' },
      { id: 3, name: 'Campus Tour & Aptitude Test', probability: 65, description: 'Interview or entrance exam taken' },
      { id: 4, name: 'Documents Verified & Seat Held', probability: 85, description: 'Marksheets approved, provisional seat' },
      { id: 5, name: 'Tuition Fee Deposited', probability: 100, description: 'First semester fee paid, enrollment confirmed' },
    ],
    customFields: [
      {
        entity_type: 'Lead',
        field_name: 'Applying For Grade / Course',
        field_type: 'Dropdown',
        options: ['Grade 1 - 5', 'Grade 6 - 10', '11th-12th Science', '11th-12th Commerce', 'B.Tech / BCA', 'MBA / PGDM', 'NEET/JEE Batch'],
      },
      {
        entity_type: 'Lead',
        field_name: 'Parent / Guardian Contact',
        field_type: 'Text',
        placeholder: 'Father/Mother name & mobile',
      },
      {
        entity_type: 'Deal',
        field_name: 'Scholarship Discount %',
        field_type: 'Number',
        placeholder: '0 - 50%',
      },
    ],
    quickFormTitle: 'Apply for Academic Admission & Scholarship 2026-27',
    quickFormFields: ['Student Name', 'Parent WhatsApp Number', 'Target Class / Course', 'Previous Year Marks %'],
    sampleDeals: [
      { title: 'B.Tech Computer Science 4-Year Enrollment', account_name: 'Aryan Sengupta', value: 480000, stage: 'Documents Verified & Seat Held', probability: 85 },
      { title: 'NEET 2-Year Target Batch Admission', account_name: 'Ananya Mukherjee', value: 165000, stage: 'Campus Tour & Aptitude Test', probability: 65 },
    ],
  },

  restaurant_catering: {
    id: 'restaurant_catering',
    name: 'Restaurant, Banquets & Catering',
    tagline: 'Event Venues, Wedding Catering & Parties',
    iconName: 'UtensilsCrossed',
    badge: 'Hospitality',
    dealTerminology: 'Event Booking',
    dealsTerminology: 'Event Bookings',
    leadTerminology: 'Event Inquiry',
    targetMonthlyRevenue: '₹22,00,000',
    pipelineStages: [
      { id: 1, name: 'Event Date Enquiry', probability: 20, description: 'Hall / catering date availability check' },
      { id: 2, name: 'Menu Selection & Tasting', probability: 50, description: 'Food tasting & per-plate pricing quote' },
      { id: 3, name: 'Hall Inspected & Blocked', probability: 75, description: 'Venue reserved temporarily' },
      { id: 4, name: '50% Event Advance Paid', probability: 90, description: 'Confirmed booking with advance token' },
      { id: 5, name: 'Event Delivered & Settled', probability: 100, description: 'Function executed & final bill cleared' },
    ],
    customFields: [
      {
        entity_type: 'Lead',
        field_name: 'Function Type',
        field_type: 'Dropdown',
        options: ['Wedding Reception', 'Birthday Party', 'Corporate Gala / Conference', 'Anniversary', 'Cocktail Dinner'],
      },
      {
        entity_type: 'Lead',
        field_name: 'Guest Count (Pax)',
        field_type: 'Number',
        placeholder: 'e.g. 250',
      },
      {
        entity_type: 'Deal',
        field_name: 'Per-Plate Rate (₹)',
        field_type: 'Currency',
        placeholder: '₹1,200',
      },
    ],
    quickFormTitle: 'Check Banquet Hall & Catering Availability',
    quickFormFields: ['Host Name', 'Mobile Number', 'Event Type', 'Event Date', 'Estimated Guests'],
    sampleDeals: [
      { title: 'Grand Royal Wedding Reception (450 Pax)', account_name: 'Singhania Family Banquet', value: 675000, stage: '50% Event Advance Paid', probability: 90 },
      { title: 'TechNova Annual Corporate Gala (180 Pax)', account_name: 'TechNova Solutions Ltd', value: 290000, stage: 'Menu Selection & Tasting', probability: 50 },
    ],
  },

  retail_wholesale: {
    id: 'retail_wholesale',
    name: 'Retail Stores & B2B Wholesale',
    tagline: 'Distributors, FMCG, Electronics & D2C Brands',
    iconName: 'ShoppingBag',
    badge: 'Volume Sales',
    dealTerminology: 'Wholesale Order',
    dealsTerminology: 'Wholesale Orders',
    leadTerminology: 'Dealer Request',
    targetMonthlyRevenue: '₹30,00,000',
    pipelineStages: [
      { id: 1, name: 'Stockist / Dealer Request', probability: 20, description: 'Store merchant or wholesale inquiry' },
      { id: 2, name: 'Product Catalog & Rate Sheet Sent', probability: 45, description: 'Wholesale tier quotation shared' },
      { id: 3, name: 'Sample Kit Tested', probability: 70, description: 'Sample dispatched and evaluated' },
      { id: 4, name: 'Proforma Invoice Approved', probability: 90, description: 'PO received, advance/credit confirmed' },
      { id: 5, name: 'Goods Dispatched & Paid', probability: 100, description: 'Delivered to warehouse & settled' },
    ],
    customFields: [
      {
        entity_type: 'Lead',
        field_name: 'Merchant Type',
        field_type: 'Dropdown',
        options: ['Independent Retail Store', 'Regional Super-Stockist', 'E-commerce Reseller', 'Franchise Partner'],
      },
      {
        entity_type: 'Lead',
        field_name: 'GSTIN Number',
        field_type: 'Text',
        placeholder: '27AAAAA0000A1Z5',
      },
      {
        entity_type: 'Deal',
        field_name: 'Credit Payment Term',
        field_type: 'Dropdown',
        options: ['100% Advance', '50% Advance + COD', '15 Days Credit', '30 Days Net'],
      },
    ],
    quickFormTitle: 'Apply for Authorized Dealership / Wholesale Catalog',
    quickFormFields: ['Store / Business Name', 'Contact Person', 'GSTIN Number', 'City / State', 'Monthly Purchase Budget'],
    sampleDeals: [
      { title: 'Q2 Bulk Electronics Restock (SKU #882)', account_name: 'Apex Digital Hub Kolkata', value: 780000, stage: 'Proforma Invoice Approved', probability: 90 },
      { title: 'Apparel Season Supply - 500 Pieces', account_name: 'Trendz Boutique Chain', value: 340000, stage: 'Product Catalog & Rate Sheet Sent', probability: 45 },
    ],
  },

  healthcare_clinic: {
    id: 'healthcare_clinic',
    name: 'Healthcare, Clinic & Diagnostics',
    tagline: 'Dental, Dermatology, IVF & Polyclinics',
    iconName: 'Stethoscope',
    badge: 'Clinical Care',
    dealTerminology: 'Treatment Plan',
    dealsTerminology: 'Treatment Plans',
    leadTerminology: 'Patient Inquiry',
    targetMonthlyRevenue: '₹15,00,000',
    pipelineStages: [
      { id: 1, name: 'Patient Consultation Request', probability: 25, description: 'Appointment request via web or phone' },
      { id: 2, name: 'Initial Diagnosis & Doctor Call', probability: 50, description: 'Doctor review of symptoms/tests' },
      { id: 3, name: 'Treatment Procedure Proposed', probability: 75, description: 'Clinical treatment estimate given' },
      { id: 4, name: 'Procedure Scheduled', probability: 90, description: 'OT / appointment slot reserved' },
      { id: 5, name: 'Procedure Completed & Followup', probability: 100, description: 'Treatment done and paid' },
    ],
    customFields: [
      {
        entity_type: 'Lead',
        field_name: 'Clinical Speciality',
        field_type: 'Dropdown',
        options: ['Dental Care', 'Dermatology & Cosmetology', 'Physiotherapy', 'Orthopedic', 'General Medicine'],
      },
      {
        entity_type: 'Deal',
        field_name: 'Doctor In-Charge',
        field_type: 'Text',
        placeholder: 'Dr. Mukherjee, MD',
      },
    ],
    quickFormTitle: 'Book a Doctor Consultation & Health Check',
    quickFormFields: ['Patient Full Name', 'Contact Number', 'Preferred Department', 'Preferred Date & Time'],
    sampleDeals: [
      { title: 'Complete Orthodontic Aligners Package', account_name: 'Tanvi Roy', value: 85000, stage: 'Procedure Scheduled', probability: 90 },
      { title: 'Executive Comprehensive Health Checkup', account_name: 'Kolkata Port Trust Executive', value: 24000, stage: 'Initial Diagnosis & Doctor Call', probability: 50 },
    ],
  },

  saas_it: {
    id: 'saas_it',
    name: 'Software, SaaS & IT Services',
    tagline: 'Tech Startups, Cloud Agencies & Dev Studios',
    iconName: 'Laptop',
    badge: 'Default Core',
    dealTerminology: 'Software Deal',
    dealsTerminology: 'Software Deals',
    leadTerminology: 'Sales Lead',
    targetMonthlyRevenue: '₹25,00,000',
    pipelineStages: [
      { id: 1, name: 'New Inbound Lead', probability: 20, description: 'Signed up or submitted demo request' },
      { id: 2, name: 'Discovery Call & Product Demo', probability: 40, description: 'Use-case presented and validated' },
      { id: 3, name: 'Proposal & Commercials Sent', probability: 60, description: 'SLA and tier pricing shared' },
      { id: 4, name: 'Procurement & Security Review', probability: 80, description: 'Legal and technical sign-off' },
      { id: 5, name: 'Contract Signed & Paid', probability: 100, description: 'Subscription active and paid' },
    ],
    customFields: [
      {
        entity_type: 'Lead',
        field_name: 'Company Team Size',
        field_type: 'Dropdown',
        options: ['1-10 Users', '11-50 Users', '51-200 Users', '200+ Enterprise'],
      },
      {
        entity_type: 'Deal',
        field_name: 'Billing Frequency',
        field_type: 'Dropdown',
        options: ['Monthly Recurring', 'Annual Upfront (20% Off)', 'Multi-Year Enterprise'],
      },
    ],
    quickFormTitle: 'Request an Interactive Live Product Demo',
    quickFormFields: ['Work Email', 'Phone Number', 'Company Name', 'Team Size'],
    sampleDeals: [
      { title: 'Enterprise Cloud Migration Contract', account_name: 'Global FinTech Corp', value: 1250000, stage: 'Procurement & Security Review', probability: 80 },
      { title: 'Annual Growth Tier CRM License (25 Seats)', account_name: 'AdVenture Media Agency', value: 360000, stage: 'Discovery Call & Product Demo', probability: 40 },
    ],
  },

  consulting: {
    id: 'consulting',
    name: 'Consulting & Professional Services',
    tagline: 'CA / Tax, Legal Firms & Business Advisors',
    iconName: 'Briefcase',
    badge: 'Advisory',
    dealTerminology: 'Client Retainer',
    dealsTerminology: 'Client Retainers',
    leadTerminology: 'Consultation Inquiry',
    targetMonthlyRevenue: '₹20,00,000',
    pipelineStages: [
      { id: 1, name: 'Advisory Consultation Inquiry', probability: 20, description: 'Client seeks legal / tax guidance' },
      { id: 2, name: 'Scoping & Compliance Audit', probability: 45, description: 'Scope of work defined' },
      { id: 3, name: 'Retainer Agreement Sent', probability: 70, description: 'Terms of engagement shared' },
      { id: 4, name: 'Engagement Letter Signed', probability: 90, description: 'Letter of authorization executed' },
      { id: 5, name: 'Retainer Retained & Active', probability: 100, description: 'Monthly retainer billed & paid' },
    ],
    customFields: [
      {
        entity_type: 'Lead',
        field_name: 'Service Requirement',
        field_type: 'Dropdown',
        options: ['GST & Income Tax Audit', 'Company Incorporation', 'Trademark & IP', 'Mergers & Legal Advisory'],
      },
    ],
    quickFormTitle: 'Book an Advisory Consultation with Expert CA/Lawyer',
    quickFormFields: ['Company Name', 'Contact Person', 'Phone Number', 'Required Advisory Service'],
    sampleDeals: [
      { title: 'Annual Corporate Tax Compliance Retainer', account_name: 'Zenith Logistics LLP', value: 240000, stage: 'Engagement Letter Signed', probability: 90 },
      { title: 'Series A Legal Diligence & Filing', account_name: 'HyperDrive Mobility', value: 450000, stage: 'Scoping & Compliance Audit', probability: 45 },
    ],
  },
};

export function getIndustryTemplate(idOrName?: string): IndustryVerticalConfig {
  if (!idOrName) return INDUSTRY_TEMPLATES.saas_it;
  
  const key = idOrName.toLowerCase().replace(/[\s&/\\-]+/g, '_');
  
  if (INDUSTRY_TEMPLATES[key]) {
    return INDUSTRY_TEMPLATES[key];
  }

  // Fallback matching
  if (key.includes('real') || key.includes('estate') || key.includes('property') || key.includes('construction')) {
    return INDUSTRY_TEMPLATES.real_estate;
  }
  if (key.includes('travel') || key.includes('tour') || key.includes('hotel') || key.includes('holiday')) {
    return INDUSTRY_TEMPLATES.travel_tourism;
  }
  if (key.includes('school') || key.includes('college') || key.includes('education') || key.includes('edtech') || key.includes('coaching')) {
    return INDUSTRY_TEMPLATES.education;
  }
  if (key.includes('restaurant') || key.includes('cater') || key.includes('food') || key.includes('banquet')) {
    return INDUSTRY_TEMPLATES.restaurant_catering;
  }
  if (key.includes('retail') || key.includes('store') || key.includes('wholesale') || key.includes('shop') || key.includes('fmcg') || key.includes('d2c')) {
    return INDUSTRY_TEMPLATES.retail_wholesale;
  }
  if (key.includes('health') || key.includes('clinic') || key.includes('hospital') || key.includes('doctor') || key.includes('dental')) {
    return INDUSTRY_TEMPLATES.healthcare_clinic;
  }
  if (key.includes('consult') || key.includes('legal') || key.includes('ca') || key.includes('tax')) {
    return INDUSTRY_TEMPLATES.consulting;
  }

  return INDUSTRY_TEMPLATES.saas_it;
}

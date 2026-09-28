export interface BackendPipelineStage {
  id: number;
  name: string;
  probability: number;
  description: string;
}

export interface BackendCustomField {
  entity_type: string;
  field_name: string;
  field_type: string;
  options?: string[];
  placeholder?: string;
}

export interface BackendSampleProduct {
  code: string;
  name: string;
  category: string;
  unit_price: number;
  stock: number;
  gst_rate_percent: number;
}

export interface BackendSampleLead {
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  source: string;
  expected_value: number;
  notes: string;
  status: string;
  lifecycle_stage: string;
}

export interface BackendSampleDeal {
  title: string;
  account_name: string;
  value: number;
  stage: string;
  probability: number;
  pipeline_name: string;
}

export interface BackendWebFormConfig {
  title: string;
  description: string;
  submit_btn_text: string;
  success_message: string;
  fields: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    placeholder?: string;
    mapping: string;
  }>;
}

export interface BackendIndustryTemplate {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  iconName: string;
  dealTerminology: string;
  dealsTerminology: string;
  leadTerminology: string;
  targetMonthlyRevenue: number;
  pipelineStages: BackendPipelineStage[];
  customFields: BackendCustomField[];
  sampleProducts: BackendSampleProduct[];
  sampleLeads: BackendSampleLead[];
  sampleDeals: BackendSampleDeal[];
  webFormPreset: BackendWebFormConfig;
}

export const BACKEND_INDUSTRY_TEMPLATES: Record<string, BackendIndustryTemplate> = {
  real_estate: {
    id: 'real_estate',
    name: 'Real Estate & Properties',
    tagline: 'Brokers, Builders & Commercial Developers',
    badge: 'High Value',
    iconName: 'Building2',
    dealTerminology: 'Property Booking',
    dealsTerminology: 'Property Bookings',
    leadTerminology: 'Property Inquiry',
    targetMonthlyRevenue: 5000000,
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
        options: ['1 BHK Smart Flat', '2 BHK Premium', '3 BHK Luxury', '4 BHK Penthouse', 'Commercial Retail Shop', 'Independent Villa'],
      },
      {
        entity_type: 'Lead',
        field_name: 'Budget Band',
        field_type: 'Dropdown',
        options: ['Under ₹35 Lakhs', '₹35L - ₹65L', '₹65L - ₹1.25 Crore', '₹1.25Cr - ₹3 Crore', 'Above ₹3 Crore'],
      },
      {
        entity_type: 'Deal',
        field_name: 'Flat / Unit Number',
        field_type: 'Text',
        placeholder: 'Tower C - Unit 1204',
      },
      {
        entity_type: 'Deal',
        field_name: 'Carpet Area (Sq Ft)',
        field_type: 'Number',
        placeholder: '1250',
      },
    ],
    sampleProducts: [
      { code: 'PROP-2BHK-01', name: '2 BHK Luxury Park Facing (1050 sq ft)', category: 'Residential', unit_price: 6500000, stock: 12, gst_rate_percent: 5 },
      { code: 'PROP-3BHK-02', name: '3 BHK High-Rise Sky Villa (1650 sq ft)', category: 'Residential', unit_price: 11500000, stock: 6, gst_rate_percent: 5 },
      { code: 'PROP-SHOP-03', name: 'Ground Floor Commercial Retail Unit (450 sq ft)', category: 'Commercial', unit_price: 5200000, stock: 4, gst_rate_percent: 12 },
    ],
    sampleLeads: [
      {
        name: 'Rajesh & Sonali Verma',
        company: 'Verma Tech Consultancy',
        email: 'rajesh.verma@gmail.com',
        phone: '+91 98301 44552',
        city: 'Kolkata',
        source: '99acres Portal',
        expected_value: 8500000,
        notes: 'Looking for 3BHK high-floor corner unit. Requested site visit cab on Saturday 11 AM.',
        status: 'Contacted',
        lifecycle_stage: 'WORKING',
      },
      {
        name: 'Vikram Malhotra',
        company: 'Malhotra Logistics',
        email: 'vikram@malhotralogistics.com',
        phone: '+91 98112 77890',
        city: 'Delhi NCR',
        source: 'Facebook Property Ad',
        expected_value: 5200000,
        notes: 'Interested in commercial shop investment with guaranteed 7% rental yield.',
        status: 'Qualified',
        lifecycle_stage: 'QUALIFIED',
      },
    ],
    sampleDeals: [
      {
        title: 'Tower C - 3BHK Penthouse Booking',
        account_name: 'Rajesh & Sonali Verma',
        value: 8500000,
        stage: 'Token Advance Received',
        probability: 85,
        pipeline_name: 'Real Estate Sales Pipeline',
      },
      {
        title: 'Commercial Retail Shop #12',
        account_name: 'Malhotra Logistics',
        value: 5200000,
        stage: 'Site Visit Scheduled',
        probability: 60,
        pipeline_name: 'Real Estate Sales Pipeline',
      },
    ],
    webFormPreset: {
      title: 'Schedule a Free VIP Project Site Visit',
      description: 'Experience luxury living. Book your complimentary site tour with dedicated relationship manager and free doorstep pickup.',
      submit_btn_text: 'Confirm VIP Site Visit',
      success_message: 'Your site visit has been scheduled! Our executive will call in 15 minutes to confirm cab pickup.',
      fields: [
        { id: 'fld_re_name', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your name', mapping: 'Lead.name' },
        { id: 'fld_re_phone', name: 'phone', label: 'WhatsApp / Mobile', type: 'tel', required: true, placeholder: '+91 98765 43210', mapping: 'Lead.phone' },
        { id: 'fld_re_config', name: 'configuration', label: 'Desired Flat Configuration', type: 'text', required: true, placeholder: 'e.g. 2BHK or 3BHK', mapping: 'Lead.notes' },
        { id: 'fld_re_budget', name: 'budget', label: 'Estimated Budget (₹)', type: 'number', required: false, placeholder: '7500000', mapping: 'Lead.expected_value' },
      ],
    },
  },

  travel_tourism: {
    id: 'travel_tourism',
    name: 'Tours & Travel Agency',
    tagline: 'Holiday Packages, Corporate & Visa Services',
    badge: 'Fast Turnover',
    iconName: 'Compass',
    dealTerminology: 'Trip Package',
    dealsTerminology: 'Trip Packages',
    leadTerminology: 'Travel Enquiry',
    targetMonthlyRevenue: 1800000,
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
        options: ['3-Star Standard', '4-Star Premium', '5-Star Luxury Resort', 'Private Pool Villa'],
      },
    ],
    sampleProducts: [
      { code: 'PKG-DUBAI-01', name: '6N/7D Luxury Dubai & Desert Safari (Per Couple)', category: 'International Tour', unit_price: 185000, stock: 50, gst_rate_percent: 5 },
      { code: 'PKG-BALI-02', name: '5N/6D Bali Romantic Villa & Nusa Penida Island', category: 'International Tour', unit_price: 145000, stock: 30, gst_rate_percent: 5 },
      { code: 'PKG-KASHMIR-03', name: '5N/6D Heaven on Earth Kashmir with Houseboat', category: 'Domestic Tour', unit_price: 78000, stock: 40, gst_rate_percent: 5 },
    ],
    sampleLeads: [
      {
        name: 'Amitabh Sharma',
        company: 'Sharma Infotech',
        email: 'amitabh.sharma@yahoo.com',
        phone: '+91 97482 11993',
        city: 'Mumbai',
        source: 'Instagram Tour Reel',
        expected_value: 245000,
        notes: 'Family of 4 traveling to Dubai for Diwali vacation. Requires 4-star Downtown hotel.',
        status: 'Proposal Sent',
        lifecycle_stage: 'WORKING',
      },
      {
        name: 'Pooja & Rohan Sen',
        company: 'Rohan Sen Studios',
        email: 'rohan.sen@gmail.com',
        phone: '+91 99033 88124',
        city: 'Kolkata',
        source: 'Google Search Ads',
        expected_value: 168000,
        notes: 'Honeymoon trip to Bali in November. Requested private pool villa in Seminyak.',
        status: 'Contacted',
        lifecycle_stage: 'WORKING',
      },
    ],
    sampleDeals: [
      {
        title: '6N/7D Luxury Dubai & Desert Safari',
        account_name: 'Amitabh Sharma Family',
        value: 245000,
        stage: 'Deposit Received',
        probability: 90,
        pipeline_name: 'Tour Packages Pipeline',
      },
      {
        title: 'Bali 5N Romantic Getaway Package',
        account_name: 'Pooja & Rohan Sen',
        value: 168000,
        stage: 'Custom Itinerary Shared',
        probability: 45,
        pipeline_name: 'Tour Packages Pipeline',
      },
    ],
    webFormPreset: {
      title: 'Get Free Custom Tour Quotation',
      description: 'Tell us your dream holiday destination and our specialist will WhatsApp a customized day-by-day itinerary and price quote in 30 minutes.',
      submit_btn_text: 'Send My Tour Plan',
      success_message: 'Thanks! Your travel consultant will send your personalized itinerary on WhatsApp.',
      fields: [
        { id: 'fld_tr_name', name: 'name', label: 'Lead Traveler Name', type: 'text', required: true, placeholder: 'Your Name', mapping: 'Lead.name' },
        { id: 'fld_tr_phone', name: 'phone', label: 'WhatsApp Number', type: 'tel', required: true, placeholder: '+91 98765 43210', mapping: 'Lead.phone' },
        { id: 'fld_tr_dest', name: 'destination', label: 'Dream Destination', type: 'text', required: true, placeholder: 'e.g. Bali, Kashmir, Dubai', mapping: 'Lead.notes' },
        { id: 'fld_tr_budget', name: 'budget', label: 'Estimated Budget (₹)', type: 'number', required: false, placeholder: '150000', mapping: 'Lead.expected_value' },
      ],
    },
  },

  education: {
    id: 'education',
    name: 'School, College & EdTech',
    tagline: 'Private Schools, Coaching & Degree Institutes',
    badge: 'Seasonal Surge',
    iconName: 'GraduationCap',
    dealTerminology: 'Student Admission',
    dealsTerminology: 'Student Admissions',
    leadTerminology: 'Admission Enquiry',
    targetMonthlyRevenue: 3500000,
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
        options: ['Nursery - KG', 'Grade 1 - 5', 'Grade 6 - 10', '11th-12th Science', '11th-12th Commerce', 'B.Tech / BCA', 'MBA / PGDM', 'NEET/JEE 2-Yr Batch'],
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
      {
        entity_type: 'Deal',
        field_name: 'Academic Year',
        field_type: 'Dropdown',
        options: ['2026-2027', '2027-2028'],
      },
    ],
    sampleProducts: [
      { code: 'EDU-BTECH-01', name: 'B.Tech Computer Science & AI (Annual Tuition)', category: 'Engineering Course', unit_price: 180000, stock: 120, gst_rate_percent: 0 },
      { code: 'EDU-NEET-02', name: 'NEET 2-Year Classroom Target Batch Course', category: 'Medical Coaching', unit_price: 145000, stock: 250, gst_rate_percent: 18 },
      { code: 'EDU-SCHOOL-03', name: 'Class 11 Science CBSE Annual Composite Fee', category: 'High School', unit_price: 95000, stock: 80, gst_rate_percent: 0 },
    ],
    sampleLeads: [
      {
        name: 'Aryan Sengupta',
        company: 'Father: Dr. Subhash Sengupta',
        email: 'subhash.sengupta@hospital.org',
        phone: '+91 94330 55122',
        city: 'Durgapur',
        source: 'Education Fair 2026',
        expected_value: 480000,
        notes: 'Candidate scored 94.2% in 12th Board. Applying for B.Tech Computer Science. Wants hostel seat.',
        status: 'Qualified',
        lifecycle_stage: 'QUALIFIED',
      },
      {
        name: 'Ananya Mukherjee',
        company: 'Mother: Sharmila Mukherjee',
        email: 'ananya.mukherjee2009@gmail.com',
        phone: '+91 98311 99045',
        city: 'Kolkata',
        source: 'Admission Banner Ad',
        expected_value: 165000,
        notes: 'Interested in 2-year NEET weekend batch. Took scholarship entrance test yesterday.',
        status: 'Contacted',
        lifecycle_stage: 'WORKING',
      },
    ],
    sampleDeals: [
      {
        title: 'B.Tech Computer Science 4-Year Enrollment',
        account_name: 'Aryan Sengupta',
        value: 480000,
        stage: 'Documents Verified & Seat Held',
        probability: 85,
        pipeline_name: 'Admissions Funnel',
      },
      {
        title: 'NEET 2-Year Target Batch Admission',
        account_name: 'Ananya Mukherjee',
        value: 165000,
        stage: 'Campus Tour & Aptitude Test',
        probability: 65,
        pipeline_name: 'Admissions Funnel',
      },
    ],
    webFormPreset: {
      title: 'Apply for Admission & Scholarship 2026-27',
      description: 'Fill in candidate details to schedule campus counselor interaction and scholarship admission test.',
      submit_btn_text: 'Submit Admission Application',
      success_message: 'Application received! The admissions office will contact parents within 24 hours.',
      fields: [
        { id: 'fld_ed_student', name: 'name', label: 'Student Full Name', type: 'text', required: true, placeholder: 'Student full name', mapping: 'Lead.name' },
        { id: 'fld_ed_parent_phone', name: 'phone', label: 'Parent WhatsApp Phone', type: 'tel', required: true, placeholder: '+91 98765 43210', mapping: 'Lead.phone' },
        { id: 'fld_ed_course', name: 'course', label: 'Target Class / Course', type: 'text', required: true, placeholder: 'e.g. 11th Science / B.Tech', mapping: 'Lead.notes' },
      ],
    },
  },

  restaurant_catering: {
    id: 'restaurant_catering',
    name: 'Restaurant, Banquets & Catering',
    tagline: 'Event Venues, Wedding Catering & Parties',
    badge: 'Hospitality',
    iconName: 'UtensilsCrossed',
    dealTerminology: 'Event Booking',
    dealsTerminology: 'Event Bookings',
    leadTerminology: 'Event Inquiry',
    targetMonthlyRevenue: 2200000,
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
        options: ['Wedding Reception', 'Birthday Party', 'Corporate Gala / Conference', 'Anniversary Dinner', 'Ring Ceremony / Sangeet'],
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
    sampleProducts: [
      { code: 'CAT-WEDD-GOLD', name: 'Royal Gold Wedding Buffet (7 Course Non-Veg)', category: 'Catering Package', unit_price: 1650, stock: 1000, gst_rate_percent: 5 },
      { code: 'CAT-CORP-LUNCH', name: 'Corporate Executive Hot Buffet (Veg & Non-Veg)', category: 'Corporate Catering', unit_price: 850, stock: 500, gst_rate_percent: 5 },
      { code: 'HALL-ROYAL-RENT', name: 'Grand Ballroom Venue Rental (Per 8-Hour Session)', category: 'Venue Rental', unit_price: 120000, stock: 1, gst_rate_percent: 18 },
    ],
    sampleLeads: [
      {
        name: 'Sunil Singhania',
        company: 'Singhania Real Estate Group',
        email: 'sunil.singhania@gmail.com',
        phone: '+91 98200 33411',
        city: 'Kolkata',
        source: 'Direct Phone Inquiry',
        expected_value: 675000,
        notes: 'Daughter wedding reception for 450 guests on 14th December. Wants Grand Ballroom.',
        status: 'Proposal Sent',
        lifecycle_stage: 'WORKING',
      },
    ],
    sampleDeals: [
      {
        title: 'Grand Royal Wedding Reception (450 Pax)',
        account_name: 'Singhania Family Banquet',
        value: 675000,
        stage: '50% Event Advance Paid',
        probability: 90,
        pipeline_name: 'Event Booking Pipeline',
      },
    ],
    webFormPreset: {
      title: 'Check Banquet Hall & Catering Availability',
      description: 'Check available dates, reserve tasting sessions, and receive customized per-plate menus.',
      submit_btn_text: 'Check Date Availability',
      success_message: 'Date request received! Banquet manager will call with availability details.',
      fields: [
        { id: 'fld_rc_name', name: 'name', label: 'Host Full Name', type: 'text', required: true, placeholder: 'Your Name', mapping: 'Lead.name' },
        { id: 'fld_rc_phone', name: 'phone', label: 'Contact Number', type: 'tel', required: true, placeholder: '+91 98765 43210', mapping: 'Lead.phone' },
        { id: 'fld_rc_guests', name: 'guests', label: 'Estimated Guests (Pax)', type: 'number', required: true, placeholder: '200', mapping: 'Lead.expected_value' },
      ],
    },
  },

  retail_wholesale: {
    id: 'retail_wholesale',
    name: 'Retail Stores & B2B Wholesale',
    tagline: 'Distributors, FMCG, Electronics & D2C Brands',
    badge: 'Volume Sales',
    iconName: 'ShoppingBag',
    dealTerminology: 'Wholesale Order',
    dealsTerminology: 'Wholesale Orders',
    leadTerminology: 'Dealer Request',
    targetMonthlyRevenue: 3000000,
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
        field_name: 'Payment Term',
        field_type: 'Dropdown',
        options: ['100% Advance Payment', '50% Advance + COD', '15 Days Net Credit', '30 Days Net Credit'],
      },
    ],
    sampleProducts: [
      { code: 'SKU-ELEC-BOX', name: 'Wireless Smart Fast Charger (Wholesale Master Carton 50 pcs)', category: 'Electronics', unit_price: 38500, stock: 200, gst_rate_percent: 18 },
      { code: 'SKU-APPR-LOT', name: 'Pure Cotton Graphic Tees Master B2B Pack (100 pcs)', category: 'Apparel', unit_price: 24000, stock: 150, gst_rate_percent: 5 },
    ],
    sampleLeads: [
      {
        name: 'Pradeep Khandelwal',
        company: 'Apex Digital Hub Stores',
        email: 'pradeep@apexdigital.in',
        phone: '+91 93310 77622',
        city: 'Kolkata',
        source: 'IndiaMART B2B Portal',
        expected_value: 780000,
        notes: 'Super-stockist looking for 500 units of accessories per month. GST registered.',
        status: 'Proposal Sent',
        lifecycle_stage: 'QUALIFIED',
      },
    ],
    sampleDeals: [
      {
        title: 'Q2 Bulk Electronics Restock (SKU #882)',
        account_name: 'Apex Digital Hub Stores',
        value: 780000,
        stage: 'Proforma Invoice Approved',
        probability: 90,
        pipeline_name: 'Wholesale Supply Funnel',
      },
    ],
    webFormPreset: {
      title: 'Apply for Authorized Dealership / Wholesale Catalog',
      description: 'Partner with us for direct wholesale trade pricing and priority supply shipments.',
      submit_btn_text: 'Request Wholesale Catalog',
      success_message: 'Dealer application received! Our sales representative will share rate sheets shortly.',
      fields: [
        { id: 'fld_rw_store', name: 'company', label: 'Store / Enterprise Name', type: 'text', required: true, placeholder: 'Business Name', mapping: 'Lead.company' },
        { id: 'fld_rw_name', name: 'name', label: 'Proprietor Name', type: 'text', required: true, placeholder: 'Owner Full Name', mapping: 'Lead.name' },
        { id: 'fld_rw_phone', name: 'phone', label: 'Business Phone', type: 'tel', required: true, placeholder: '+91 98765 43210', mapping: 'Lead.phone' },
      ],
    },
  },

  healthcare_clinic: {
    id: 'healthcare_clinic',
    name: 'Healthcare, Clinic & Diagnostics',
    tagline: 'Dental, Dermatology, IVF & Polyclinics',
    badge: 'Clinical Care',
    iconName: 'Stethoscope',
    dealTerminology: 'Treatment Plan',
    dealsTerminology: 'Treatment Plans',
    leadTerminology: 'Patient Inquiry',
    targetMonthlyRevenue: 1500000,
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
    ],
    sampleProducts: [
      { code: 'MED-ALIGN-01', name: 'Complete Invisible Dental Aligners Plan (Dual Arch)', category: 'Orthodontics', unit_price: 85000, stock: 100, gst_rate_percent: 12 },
      { code: 'MED-HEALTH-02', name: 'Executive Master Comprehensive Health Checkup Package', category: 'Diagnostics', unit_price: 18500, stock: 500, gst_rate_percent: 0 },
    ],
    sampleLeads: [
      {
        name: 'Tanvi Roy',
        company: 'Self',
        email: 'tanvi.roy@gmail.com',
        phone: '+91 98305 66712',
        city: 'Kolkata',
        source: 'Practo / Google Clinic Search',
        expected_value: 85000,
        notes: 'Seeking consultation for clear aligners treatment. Requested evening doctor slot.',
        status: 'Meeting Scheduled',
        lifecycle_stage: 'WORKING',
      },
    ],
    sampleDeals: [
      {
        title: 'Complete Orthodontic Aligners Package',
        account_name: 'Tanvi Roy',
        value: 85000,
        stage: 'Procedure Scheduled',
        probability: 90,
        pipeline_name: 'Patient Treatment Pipeline',
      },
    ],
    webFormPreset: {
      title: 'Book a Doctor Consultation & Health Check',
      description: 'Schedule a specialized consultation with senior doctors and diagnostic specialists.',
      submit_btn_text: 'Book Consultation Slot',
      success_message: 'Consultation request confirmed! Clinic coordinator will confirm the exact time slot.',
      fields: [
        { id: 'fld_hc_name', name: 'name', label: 'Patient Name', type: 'text', required: true, placeholder: 'Patient Full Name', mapping: 'Lead.name' },
        { id: 'fld_hc_phone', name: 'phone', label: 'Mobile Number', type: 'tel', required: true, placeholder: '+91 98765 43210', mapping: 'Lead.phone' },
        { id: 'fld_hc_concern', name: 'concern', label: 'Health Concern / Department', type: 'text', required: true, placeholder: 'e.g. Skin, Dental, General', mapping: 'Lead.notes' },
      ],
    },
  },

  saas_it: {
    id: 'saas_it',
    name: 'Software, SaaS & IT Services',
    tagline: 'Tech Startups, Cloud Agencies & Dev Studios',
    badge: 'Default Core',
    iconName: 'Laptop',
    dealTerminology: 'Software Deal',
    dealsTerminology: 'Software Deals',
    leadTerminology: 'Sales Lead',
    targetMonthlyRevenue: 2500000,
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
    ],
    sampleProducts: [
      { code: 'SAAS-ENT-01', name: 'Annual Enterprise CRM Platform License (Unlimited Users)', category: 'Software License', unit_price: 360000, stock: 999, gst_rate_percent: 18 },
      { code: 'SAAS-ONB-02', name: 'White-Glove Data Migration & Dedicated CSM Setup', category: 'Professional Services', unit_price: 75000, stock: 50, gst_rate_percent: 18 },
    ],
    sampleLeads: [
      {
        name: 'Saurabh Banerjee',
        company: 'Global FinTech Corp',
        email: 'saurabh@globalfintech.io',
        phone: '+91 98319 88771',
        city: 'Bengaluru',
        source: 'Direct Website Sign-up',
        expected_value: 1250000,
        notes: 'Needs SOC2 compliant CRM with Cashfree automated billing integration.',
        status: 'Demo Scheduled',
        lifecycle_stage: 'QUALIFIED',
      },
    ],
    sampleDeals: [
      {
        title: 'Enterprise Cloud Migration Contract',
        account_name: 'Global FinTech Corp',
        value: 1250000,
        stage: 'Procurement & Security Review',
        probability: 80,
        pipeline_name: 'Standard Enterprise Pipeline',
      },
    ],
    webFormPreset: {
      title: 'Request an Interactive Live Product Demo',
      description: 'See how our enterprise platform speeds up your team workflow by 4x.',
      submit_btn_text: 'Schedule Live Demo',
      success_message: 'Demo booked! Our solutions engineer will email a Google Meet link.',
      fields: [
        { id: 'fld_sa_name', name: 'name', label: 'Your Name', type: 'text', required: true, placeholder: 'Full Name', mapping: 'Lead.name' },
        { id: 'fld_sa_email', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'name@company.com', mapping: 'Lead.email' },
        { id: 'fld_sa_phone', name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+91 98765 43210', mapping: 'Lead.phone' },
      ],
    },
  },
};

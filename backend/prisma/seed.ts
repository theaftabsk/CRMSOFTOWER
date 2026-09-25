import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Enterprise CRM PostgreSQL database...');

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { id: 'ORG001' },
    update: {},
    create: {
      id: 'ORG001',
      name: 'ABC Technologies',
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
      currency: '₹',
      timezone: 'Asia/Kolkata',
      address: '123 Innovation Tech Park, Suite 402, City Hub',
    },
  });

  // 2. Roles & Permissions
  const permissionsData = [
    { id: 'perm-leads-view', slug: 'leads:view', module: 'leads', description: 'View leads list and details' },
    { id: 'perm-leads-create', slug: 'leads:create', module: 'leads', description: 'Create new leads' },
    { id: 'perm-leads-edit', slug: 'leads:edit', module: 'leads', description: 'Edit existing leads' },
    { id: 'perm-leads-delete', slug: 'leads:delete', module: 'leads', description: 'Delete leads' },
    { id: 'perm-deals-view', slug: 'deals:view', module: 'deals', description: 'View deals pipeline' },
    { id: 'perm-deals-edit', slug: 'deals:edit', module: 'deals', description: 'Update deal stage and value' },
    { id: 'perm-invoices-create', slug: 'invoices:create', module: 'invoices', description: 'Generate customer invoices' },
    { id: 'perm-reports-view', slug: 'reports:view', module: 'reports', description: 'View revenue & performance reports' },
    { id: 'perm-settings-manage', slug: 'settings:manage', module: 'settings', description: 'Manage organization settings' },
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { id: 'role-admin' },
    update: {},
    create: {
      id: 'role-admin',
      organization_id: org.id,
      name: 'Admin',
      description: 'Full organizational administrative privileges',
      is_system: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { id: 'role-manager' },
    update: {},
    create: {
      id: 'role-manager',
      organization_id: org.id,
      name: 'Manager',
      description: 'Sales and team pipeline manager',
      is_system: true,
    },
  });

  // 3. Users
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@abctechnologies.com' },
    update: {},
    create: {
      id: 'USR001',
      organization_id: org.id,
      name: 'Aftab Admin',
      email: 'admin@abctechnologies.com',
      phone: '+91 9876543210',
      role: 'Admin',
      department: 'Executive Management',
      profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
      status: 'Active',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'vikram@abctechnologies.com' },
    update: {},
    create: {
      id: 'USR002',
      organization_id: org.id,
      name: 'Vikram Sales Manager',
      email: 'vikram@abctechnologies.com',
      phone: '+91 9876543211',
      role: 'Manager',
      department: 'Sales & Growth',
      profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      status: 'Active',
    },
  });

  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: user1.id, role_id: adminRole.id } },
    update: {},
    create: { user_id: user1.id, role_id: adminRole.id },
  });

  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: user2.id, role_id: managerRole.id } },
    update: {},
    create: { user_id: user2.id, role_id: managerRole.id },
  });

  // 4. Leads
  await prisma.lead.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'LD001',
        organization_id: org.id,
        name: 'Rajesh Kumar',
        company: 'Delhi Public School Portal',
        email: 'rajesh@dpsportal.edu.in',
        phone: '+91 9811223344',
        status: 'Qualified',
        source: 'Website Form',
        assigned_to: 'Vikram Sales Manager',
        expected_value: 50000,
        notes: 'Customer wants complete ERP website and student portal within ₹50,000 budget.',
      },
      {
        id: 'LD002',
        organization_id: org.id,
        name: 'Priya Sharma',
        company: 'Apex Health Systems',
        email: 'priya@apexhealth.co.in',
        phone: '+91 9822334455',
        status: 'Contacted',
        source: 'LinkedIn InMail',
        assigned_to: 'Rohan Sales Exec',
        expected_value: 120000,
        notes: 'Needs SaaS patient management portal.',
      },
    ],
  });

  // 5. Accounts
  const account1 = await prisma.account.upsert({
    where: { id: 'ACC001' },
    update: {},
    create: {
      id: 'ACC001',
      organization_id: org.id,
      name: 'Apex Health Systems',
      industry: 'Healthcare Technology',
      website: 'https://apexhealth.co.in',
      annual_revenue: 15000000,
      employee_count: 120,
      billing_address: '45 Healthcare Avenue, Tech Zone 2, New Delhi',
    },
  });

  // 6. Contacts
  await prisma.contact.upsert({
    where: { id: 'CNT001' },
    update: {},
    create: {
      id: 'CNT001',
      organization_id: org.id,
      account_id: account1.id,
      name: 'Dr. Priya Sharma',
      email: 'priya@apexhealth.co.in',
      phone: '+91 9822334455',
      designation: 'VP of Technology & Operations',
      company: 'Apex Health Systems',
      city: 'New Delhi',
      status: 'Active',
    },
  });

  // 7. Deals
  await prisma.deal.upsert({
    where: { id: 'DL001' },
    update: {},
    create: {
      id: 'DL001',
      organization_id: org.id,
      account_id: account1.id,
      title: 'Apex Hospital ERP Suite',
      account_name: 'Apex Health Systems',
      stage: 'Proposal Sent',
      value: 120000,
      closing_date: '2026-09-30',
      owner: 'Vikram Sales Manager',
      probability: 75,
    },
  });

  // 8. Tasks
  await prisma.task.upsert({
    where: { id: 'TSK001' },
    update: {},
    create: {
      id: 'TSK001',
      organization_id: org.id,
      title: 'Send finalized commercial proposal to Dr. Priya',
      assigned_to: 'Vikram Sales Manager',
      priority: 'Urgent',
      due_date: '2026-09-07',
      status: 'Pending',
      related_type: 'Deal',
      related_name: 'Apex Hospital ERP Suite',
    },
  });

  // 9. Call Logs
  await prisma.callLog.upsert({
    where: { id: 'CL001' },
    update: {},
    create: {
      id: 'CL001',
      organization_id: org.id,
      customer_name: 'Rajesh Kumar (DPS Portal)',
      caller_user: 'Vikram Sales Manager',
      duration: '14 mins',
      result: 'Interested - Send Proposal',
      notes: 'Discussed website requirements. Customer requested custom quote within ₹50,000.',
      date_time: '2026-09-06 02:30 PM',
    },
  });

  // 10. Meetings
  await prisma.meeting.upsert({
    where: { id: 'MTG001' },
    update: {},
    create: {
      id: 'MTG001',
      organization_id: org.id,
      title: 'Apex Hospital Cloud ERP Architecture Demo',
      date_time: '2026-09-07 11:00 AM',
      participants: ['Dr. Priya Sharma', 'Vikram Sales Manager'],
      status: 'Scheduled',
      location: 'Google Meet',
    },
  });

  // 11. Products
  await prisma.product.upsert({
    where: { id: 'PRD001' },
    update: {},
    create: {
      id: 'PRD001',
      organization_id: org.id,
      code: 'PRD-WEB-01',
      name: 'Custom SaaS Portal Development',
      category: 'Software Services',
      unit_price: 50000,
      stock: 99,
      gst_rate_percent: 18,
    },
  });

  // 12. Invoices & Payments
  const invoice1 = await prisma.invoice.upsert({
    where: { invoice_number: 'INV-2026-001' },
    update: {
      payment_token: 'pay_token_apex_demo_2026',
      items: [
        { name: 'Enterprise Cloud ERP Suite', qty: 1, unit_price: 120000, total: 120000 },
        { name: 'Implementation & Training Support', qty: 1, unit_price: 21600, total: 21600 },
      ],
    },
    create: {
      id: 'INV001',
      organization_id: org.id,
      account_id: account1.id,
      invoice_number: 'INV-2026-001',
      account_name: 'Apex Health Systems',
      total_amount: 141600,
      paid_amount: 50000,
      due_amount: 91600,
      status: 'Partial',
      issue_date: '2026-09-01',
      due_date: '2026-09-15',
      payment_token: 'pay_token_apex_demo_2026',
      items: [
        { name: 'Enterprise Cloud ERP Suite', qty: 1, unit_price: 120000, total: 120000 },
        { name: 'Implementation & Training Support', qty: 1, unit_price: 21600, total: 21600 },
      ],
    },
  });

  await prisma.payment.upsert({
    where: { payment_number: 'PAY-2026-001' },
    update: {},
    create: {
      id: 'PAY001',
      invoice_id: invoice1.id,
      payment_number: 'PAY-2026-001',
      amount: 50000,
      payment_date: '2026-09-02',
      method: 'Bank Transfer',
      notes: 'Initial 35% advance deposit received',
    },
  });

  // 13. Demo Web Form
  await prisma.webForm.upsert({
    where: { id: 'form-website-inquiry' },
    update: {},
    create: {
      id: 'form-website-inquiry',
      organization_id: org.id,
      title: 'Website Product Inquiry Form',
      description: 'Request a free enterprise demonstration and customized quotation.',
      fields: [
        { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Rahul Sharma' },
        { name: 'email', label: 'Business Email', type: 'email', required: true, placeholder: 'e.g. rahul@company.com' },
        { name: 'phone', label: 'Contact Phone', type: 'tel', required: true, placeholder: 'e.g. +91 98765 43210' },
        { name: 'company', label: 'Company / Organization', type: 'text', required: false, placeholder: 'e.g. Acme Tech Solutions' },
        { name: 'message', label: 'Tell us about your project requirements', type: 'textarea', required: false, placeholder: 'How can we help your team succeed?' },
      ],
      submit_btn_text: 'Request Demo',
      success_message: 'Thank you! Our sales specialist will contact you within 2 hours.',
      is_active: true,
      submissions_count: 12,
    },
  });

  // 14. Demo Partner API Key
  // raw key: "crm_live_demo_key_super_secure_123"
  // SHA-256 hash:
  const demoKeyRaw = 'crm_live_demo_key_super_secure_123';
  const cryptoModule = await import('crypto');
  const demoKeyHash = cryptoModule.createHash('sha256').update(demoKeyRaw).digest('hex');

  await prisma.apiKey.upsert({
    where: { api_key_hash: demoKeyHash },
    update: {},
    create: {
      id: 'key-partner-demo',
      organization_id: org.id,
      key_name: 'Production Partner Mobile App',
      key_prefix: 'crm_live_demo...',
      api_key_hash: demoKeyHash,
      permissions: ['leads:read', 'leads:write', 'deals:read', 'deals:write', 'invoices:read', 'invoices:write'],
      rate_limit_per_min: 150,
      is_revoked: false,
    },
  });

  // 15. SaaS Plans
  await prisma.saaSPlan.createMany({
    skipDuplicates: true,
    data: [
      { id: 'PLAN-FREE', tier: 'FREE', price_per_user_month: 0, user_limit: 2, features: ['Core Lead & Contact Manager', 'Kanban Deal Pipeline', '1 GB File Storage'] },
      { id: 'PLAN-STARTER', tier: 'STARTER', price_per_user_month: 499, user_limit: 5, features: ['All FREE Features', 'Finance & Invoice Engine', '5 GB Storage'] },
      { id: 'PLAN-PRO', tier: 'PROFESSIONAL', price_per_user_month: 999, user_limit: 25, features: ['All STARTER Features', 'Custom Dynamic Fields Builder', 'Audit Trail Logs', '25 GB Storage'] },
      { id: 'PLAN-BIZ', tier: 'BUSINESS', price_per_user_month: 1799, user_limit: 100, features: ['All PRO Features', 'Dedicated Database Tenant', '100 GB Storage'] },
    ],
  });

  // 14. Workflows & Webhooks Demo
  await prisma.workflow.upsert({
    where: { id: 'wf-lead-qualified' },
    update: {},
    create: {
      id: 'wf-lead-qualified',
      organization_id: org.id,
      name: 'Auto-Task on Lead Qualification',
      description: 'Automatically creates a follow-up task and alerts sales reps when a lead is qualified.',
      trigger_event: 'lead.qualified',
      is_active: true,
    },
  });

  console.log('Enterprise CRM Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRM PostgreSQL database...');

  // 1. Create Organization
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

  // 2. Create Users
  await prisma.user.createMany({
    skipDuplicates: true,
    data: [
      {
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
      {
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
    ],
  });

  // 3. Create Leads
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

  // 4. Create Accounts
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

  // 5. Create Contacts
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

  // 6. Create Deals
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

  // 7. Create Tasks
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

  // 8. Create Call Logs
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

  // 9. Create Meetings
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

  // 10. Create Products
  await prisma.product.upsert({
    where: { id: 'PRD001' },
    update: {},
    create: {
      id: 'PRD001',
      code: 'PRD-WEB-01',
      name: 'Custom SaaS Portal Development',
      category: 'Software Services',
      unit_price: 50000,
      stock: 99,
      gst_rate_percent: 18,
    },
  });

  // 11. Create SaaS Plans
  await prisma.saaSPlan.createMany({
    skipDuplicates: true,
    data: [
      { id: 'PLAN-FREE', tier: 'FREE', price_per_user_month: 0, user_limit: 2, features: ['Core Lead & Contact Manager', 'Kanban Deal Pipeline', '1 GB File Storage'] },
      { id: 'PLAN-STARTER', tier: 'STARTER', price_per_user_month: 499, user_limit: 5, features: ['All FREE Features', 'Finance & Invoice Engine', '5 GB Storage'] },
      { id: 'PLAN-PRO', tier: 'PROFESSIONAL', price_per_user_month: 999, user_limit: 25, features: ['All STARTER Features', 'Custom Dynamic Fields Builder', 'Audit Trail Logs', '25 GB Storage'] },
      { id: 'PLAN-BIZ', tier: 'BUSINESS', price_per_user_month: 1799, user_limit: 100, features: ['All PRO Features', 'Dedicated Database Tenant', '100 GB Storage'] },
    ],
  });

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

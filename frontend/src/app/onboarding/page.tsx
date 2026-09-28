'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ZyvoLogo from '../../components/ZyvoLogo';
import { 
  Building2, Layers, MapPin, GitBranch, Users, 
  CheckCircle2, ArrowRight, ArrowLeft, ChevronDown, Check, ShieldCheck, 
  Sparkles, Compass, GraduationCap, UtensilsCrossed, ShoppingBag, Stethoscope, Laptop, Briefcase
} from 'lucide-react';
import { INDUSTRY_TEMPLATES } from '../../config/industryTemplates';
import { api } from '../../lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { organization, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State across all steps
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    businessType: 'Private Limited Company',
    companyName: '',
    industry: 'Software / SaaS & IT Services',
    selectedIndustryKey: 'saas_it',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    website: '',

    // Step 2: Address (Only address kept, GST completely removed)
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',

    // Step 3: Plan
    selectedPlan: 'growth',

    // Step 4: Sales Pipeline
    pipelineStages: [
      { id: 1, name: 'New Lead', probability: 20 },
      { id: 2, name: 'Discovery & Demo', probability: 40 },
      { id: 3, name: 'Proposal Sent', probability: 60 },
      { id: 4, name: 'Negotiation', probability: 80 },
      { id: 5, name: 'Won / Signed', probability: 100 },
    ],
    targetMonthlyRevenue: '₹25,00,000',

    // Step 5: Team Invite
    teamInvites: [
      { email: '', role: 'Sales Rep' }
    ]
  });

  // Load real organization data from backend on mount
  useEffect(() => {
    async function loadOrgData() {
      try {
        const res = await fetch('/api/organizations/current');
        if (res.ok) {
          const org = await res.json();
          if (org) {
            setFormData(prev => ({
              ...prev,
              companyName: org.name || prev.companyName,
              currency: org.currency === '₹' ? 'INR (₹)' : prev.currency,
              timezone: org.timezone || prev.timezone,
              address: org.address || prev.address,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch org from database:', err);
      }
    }

    if (isAuthenticated) {
      loadOrgData();
    } else if (organization?.name) {
      setFormData(prev => ({ ...prev, companyName: organization.name }));
    }
  }, [isAuthenticated, organization]);

  const steps = [
    { number: 1, title: 'Company Info', desc: 'Legal entity & profile', icon: Building2 },
    { number: 2, title: 'Office Address', desc: 'Operating location & city', icon: MapPin },
    { number: 3, title: 'Select a Plan', desc: 'Choose your scale tier', icon: Layers },
    { number: 4, title: 'Sales Pipeline', desc: 'Deal stages & targets', icon: GitBranch },
    { number: 5, title: 'Invite Team', desc: 'Assign user permissions', icon: Users },
    { number: 6, title: 'Review & Launch', desc: 'Verify and start command', icon: CheckCircle2 },
  ];

  const handleSelectIndustry = (key: string) => {
    const template = INDUSTRY_TEMPLATES[key];
    if (!template) return;
    setFormData(prev => ({
      ...prev,
      selectedIndustryKey: key,
      industry: template.name,
      targetMonthlyRevenue: template.targetMonthlyRevenue,
      pipelineStages: template.pipelineStages.map(s => ({
        id: s.id,
        name: s.name,
        probability: s.probability,
      })),
    }));
  };

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // 1. Real Database Update for Organization
      const fullAddress = [formData.address, formData.city, formData.state, formData.pincode]
        .filter(Boolean)
        .join(', ');

      await fetch('/api/organizations/current', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.companyName.trim() || undefined,
          currency: formData.currency.includes('INR') ? '₹' : '$',
          timezone: formData.timezone.includes('Asia/Kolkata') ? 'Asia/Kolkata' : formData.timezone,
          address: fullAddress || undefined,
        }),
      });

      // 2. Apply Industry Template & Provision Custom Fields / Forms / Sample Deals & Products
      try {
        await api.applyIndustry({
          industry_id: formData.selectedIndustryKey || 'saas_it',
          target_monthly_revenue: formData.targetMonthlyRevenue,
          pipeline_stages: formData.pipelineStages,
          seed_sample_deals: true,
          seed_custom_fields: true,
          seed_webform: true,
        });
      } catch (indErr) {
        console.warn('Industry template apply fallback:', indErr);
      }

      // 3. Mark Onboarding Complete in session
      if (typeof window !== 'undefined') {
        localStorage.setItem(`onboarding_${organization?.id || 'org'}`, 'true');
        localStorage.setItem('crm_selected_industry', formData.selectedIndustryKey || 'saas_it');
      }

      // Transition smoothly into live real dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding save error:', err);
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamInvites: [...prev.teamInvites, { email: '', role: 'Sales Rep' }]
    }));
  };

  return (
    <div className="min-h-screen bg-[#F6F6F8] antialiased text-[#111111] flex flex-col justify-between">
      {/* Top Application Header */}
      <header className="bg-white border-b border-[#E5E5E5] px-4 sm:px-8 py-3.5 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ZyvoLogo height={24} className="text-[#111111]" />
          </Link>
          <div className="h-4 w-px bg-[#E5E5E5] hidden sm:block" />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-[#111111]">Company Setup</span>
            <span className="text-[10px] bg-[#F4F4F6] text-[#666666] px-2 py-0.5 rounded-full font-mono">
              Step {currentStep} of 6
            </span>
          </div>
        </div>

        {/* Workspace Context Selector */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs">
            <Building2 className="w-3.5 h-3.5 text-[#666666]" />
            <span className="font-medium text-[#111111] max-w-[180px] truncate">
              {formData.companyName || organization?.name || 'My Company'}
            </span>
            <span className="text-[#999999]">/</span>
            <span className="text-[#666666]">{formData.city || 'India'}</span>
            <ChevronDown className="w-3 h-3 text-[#999999]" />
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-[#666666] hover:text-[#111111] font-medium px-2 py-1 transition"
          >
            Save & Exit
          </button>
        </div>
      </header>

      {/* Main Body Container with Left Stepper and Right Content Card */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex-1">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
          
          {/* Left Vertical Stepper Navigation (Matching Reference Bottom Design) */}
          <aside className="lg:col-span-4 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#E5E5E5] bg-[#FAFAFA]/70 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888]">Setup Progress</h3>
                <p className="text-xs text-[#666666] mt-0.5">Configure your organization in minutes</p>
              </div>

              {/* Vertical Stepper with connected lines */}
              <nav className="space-y-1 relative">
                {steps.map((step, idx) => {
                  const isActive = step.number === currentStep;
                  const isCompleted = step.number < currentStep;
                  const isLast = idx === steps.length - 1;

                  return (
                    <div key={step.number} className="relative flex items-start group">
                      {/* Connecting vertical line */}
                      {!isLast && (
                        <div 
                          className={`absolute left-3.5 top-8 w-0.5 h-7 transition-colors ${
                            isCompleted ? 'bg-[#111111]' : 'bg-[#E5E5E5]'
                          }`} 
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (step.number <= currentStep || step.number === currentStep + 1) {
                            setCurrentStep(step.number);
                          }
                        }}
                        className={`flex items-start space-x-3.5 w-full text-left p-2 rounded-xl transition duration-150 ${
                          isActive 
                            ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E5E5E5]' 
                            : 'hover:bg-black/[0.02]'
                        }`}
                      >
                        {/* Number Badge or Checkmark */}
                        <div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                            isCompleted
                              ? 'bg-[#111111] text-white'
                              : isActive
                              ? 'bg-[#111111] text-white ring-4 ring-[#111111]/10'
                              : 'bg-white border border-[#D4D4D4] text-[#888888]'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : step.number}
                        </div>

                        {/* Title & Description */}
                        <div className="pt-0.5">
                          <div className={`text-xs font-semibold ${isActive ? 'text-[#111111]' : isCompleted ? 'text-[#404040]' : 'text-[#888888]'}`}>
                            {step.title}
                          </div>
                          <div className="text-[11px] text-[#888888] leading-tight">
                            {step.desc}
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Security Assurance */}
            <div className="pt-6 border-t border-[#E5E5E5] mt-6 flex items-center space-x-2 text-[11px] text-[#666666]">
              <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>Multi-tenant encrypted vault & enterprise security</span>
            </div>
          </aside>

          {/* Right Main Setup Area */}
          <div className="lg:col-span-8 p-6 sm:p-10 flex flex-col justify-between">
            <div className="max-w-2xl w-full">
              
              {/* STEP 1: COMPANY INFO */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                      Company Information
                    </h2>
                    <p className="text-xs text-[#666666] mt-1">
                      Please review and confirm the core registration details for your sales command center.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Business Type */}
                    <div>
                      <label className="block font-medium text-[#404040] mb-1.5">Business Type</label>
                      <select 
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] outline-none transition"
                      >
                        <option>Private Limited Company</option>
                        <option>Limited Liability Partnership (LLP)</option>
                        <option>Sole Proprietorship</option>
                        <option>Partnership Firm</option>
                        <option>Public Limited Company</option>
                        <option>Freelancer / Individual Contractor</option>
                      </select>
                    </div>

                    {/* Legal Business Name */}
                    <div>
                      <label className="block font-medium text-[#404040] mb-1.5">Legal Business Name</label>
                      <input 
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Enter legal business name"
                        className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] placeholder:text-[#999999] outline-none transition"
                      />
                    </div>

                    {/* Industry Sector Interactive Grid Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-medium text-[#404040]">
                          Select Your Business Industry / Vertical
                        </label>
                        <span className="text-[11px] font-medium text-[#16A34A] flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Auto-configures pipelines & forms</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {Object.values(INDUSTRY_TEMPLATES).map((template) => {
                          const isSelected = formData.selectedIndustryKey === template.id;
                          const iconMap: Record<string, React.ElementType> = {
                            Building2,
                            Compass,
                            GraduationCap,
                            UtensilsCrossed,
                            ShoppingBag,
                            Stethoscope,
                            Laptop,
                            Briefcase,
                          };
                          const IconComp = iconMap[template.iconName] || Building2;

                          return (
                            <div
                              key={template.id}
                              onClick={() => handleSelectIndustry(template.id)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                                isSelected
                                  ? 'border-[#111111] bg-white ring-2 ring-[#111111] shadow-sm'
                                  : 'border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#D4D4D4] hover:bg-white'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#111111] text-white' : 'bg-[#EFEFEF] text-[#444444]'}`}>
                                    <IconComp className="w-4 h-4" />
                                  </div>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isSelected ? 'bg-[#111111] text-white' : 'bg-white border border-[#E5E5E5] text-[#666666]'}`}>
                                    {template.badge}
                                  </span>
                                </div>
                                <div className="font-semibold text-xs text-[#111111] mt-2.5 leading-snug">
                                  {template.name}
                                </div>
                                <div className="text-[11px] text-[#666666] mt-0.5 line-clamp-1">
                                  {template.tagline}
                                </div>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-[#EAEAEA] flex items-center justify-between text-[10px]">
                                <span className="text-[#888888] font-mono">
                                  {template.dealTerminology}
                                </span>
                                {isSelected ? (
                                  <span className="w-4 h-4 rounded-full bg-[#111111] text-white flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5" />
                                  </span>
                                ) : (
                                  <span className="text-[#AAAAAA]">Select</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Company Website (Optional) */}
                    <div>
                      <label className="block font-medium text-[#404040] mb-1.5">Company Website (Optional)</label>
                      <input 
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://yourcompany.com"
                        className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] placeholder:text-[#999999] outline-none transition"
                      />
                    </div>

                    {/* Currency & Timezone Preferences */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block font-medium text-[#404040] mb-1.5">Default Currency</label>
                        <select 
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] outline-none transition font-mono"
                        >
                          <option>INR (₹) - Indian Rupee</option>
                          <option>USD ($) - US Dollar</option>
                          <option>EUR (€) - Euro</option>
                          <option>GBP (£) - British Pound</option>
                          <option>AED (د.إ) - UAE Dirham</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-[#404040] mb-1.5">Operational Timezone</label>
                        <select 
                          value={formData.timezone}
                          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                          className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] outline-none transition"
                        >
                          <option>Asia/Kolkata (IST - UTC+05:30)</option>
                          <option>Asia/Dubai (GST - UTC+04:00)</option>
                          <option>Europe/London (GMT/BST)</option>
                          <option>America/New_York (EST/EDT)</option>
                          <option>Asia/Singapore (SGT - UTC+08:00)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: BUSINESS & OFFICE ADDRESS */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                      Business & Office Address
                    </h2>
                    <p className="text-xs text-[#666666] mt-1">
                      Enter your official headquarters or operating business address.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Street Address */}
                    <div>
                      <label className="block font-medium text-[#404040] mb-1.5">Registered Office / Street Address</label>
                      <input 
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter official street address, suite or building name"
                        className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] placeholder:text-[#999999] outline-none transition"
                      />
                    </div>

                    {/* City, State, PIN */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-[#404040] mb-1.5">City</label>
                        <input 
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="City"
                          className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#404040] mb-1.5">State / Region</label>
                        <input 
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="State"
                          className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#404040] mb-1.5">PIN / Postal Code</label>
                        <input 
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          placeholder="400001"
                          maxLength={10}
                          className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] font-mono outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: SELECT A PLAN */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                      Select Your CRM Plan
                    </h2>
                    <p className="text-xs text-[#666666] mt-1">
                      Transparent pricing with zero hidden fees. Scale your sales pipeline as your business expands.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Starter Tier */}
                    <div 
                      onClick={() => setFormData({ ...formData, selectedPlan: 'starter' })}
                      className={`p-4 border rounded-xl cursor-pointer transition flex flex-col justify-between ${
                        formData.selectedPlan === 'starter'
                          ? 'border-[#111111] bg-white ring-2 ring-[#111111] shadow-sm'
                          : 'border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#D4D4D4]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#111111]">Starter</div>
                        <div className="text-xl font-bold font-mono text-[#111111] mt-2">₹0</div>
                        <div className="text-[10px] text-[#666666] mt-0.5">Free forever trial</div>
                        <ul className="mt-4 space-y-2 text-[11px] text-[#404040]">
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Up to 5 Team Members</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>500 Leads & Contacts</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Standard Pipeline Management</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-6 pt-3 border-t border-[#E5E5E5] text-center">
                        <span className="text-xs font-semibold text-[#111111]">
                          {formData.selectedPlan === 'starter' ? 'Selected' : 'Select Starter'}
                        </span>
                      </div>
                    </div>

                    {/* Pro Growth (Recommended) */}
                    <div 
                      onClick={() => setFormData({ ...formData, selectedPlan: 'growth' })}
                      className={`p-4 border rounded-xl cursor-pointer transition flex flex-col justify-between relative ${
                        formData.selectedPlan === 'growth'
                          ? 'border-[#111111] bg-white ring-2 ring-[#111111] shadow-md'
                          : 'border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#D4D4D4]'
                      }`}
                    >
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                        RECOMMENDED
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#111111]">Pro Growth</div>
                        <div className="text-xl font-bold font-mono text-[#111111] mt-2">₹2,499<span className="text-xs font-normal text-[#666666]">/mo</span></div>
                        <div className="text-[10px] text-[#666666] mt-0.5">Billed monthly or annually</div>
                        <ul className="mt-4 space-y-2 text-[11px] text-[#404040]">
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Unlimited Leads & Deals</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Automated Deal Velocity</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Web Lead Capture Forms</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Multi-Industry Terminology</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-6 pt-3 border-t border-[#E5E5E5] text-center">
                        <span className="text-xs font-semibold text-[#111111]">
                          {formData.selectedPlan === 'growth' ? 'Selected' : 'Select Growth'}
                        </span>
                      </div>
                    </div>

                    {/* Enterprise */}
                    <div 
                      onClick={() => setFormData({ ...formData, selectedPlan: 'enterprise' })}
                      className={`p-4 border rounded-xl cursor-pointer transition flex flex-col justify-between ${
                        formData.selectedPlan === 'enterprise'
                          ? 'border-[#111111] bg-white ring-2 ring-[#111111] shadow-sm'
                          : 'border-[#E5E5E5] bg-[#FAFAFA] hover:border-[#D4D4D4]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[#111111]">Enterprise</div>
                        <div className="text-xl font-bold font-mono text-[#111111] mt-2">Custom</div>
                        <div className="text-[10px] text-[#666666] mt-0.5">Tailored infrastructure</div>
                        <ul className="mt-4 space-y-2 text-[11px] text-[#404040]">
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Dedicated Database Tenant</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Unlimited Seats & Audit Log</span>
                          </li>
                          <li className="flex items-center space-x-1.5">
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span>Custom Domain (CNAME)</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-6 pt-3 border-t border-[#E5E5E5] text-center">
                        <span className="text-xs font-semibold text-[#111111]">
                          {formData.selectedPlan === 'enterprise' ? 'Selected' : 'Select Enterprise'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: SALES PIPELINE */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#E5E5E5] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                        Sales Pipeline Architecture
                      </h2>
                      <p className="text-xs text-[#666666] mt-1">
                        Tailored for <span className="font-semibold text-[#111111]">{formData.industry}</span> ({INDUSTRY_TEMPLATES[formData.selectedIndustryKey]?.dealTerminology || 'Deal'} Lifecycle).
                      </p>
                    </div>
                    <span className="self-start sm:self-auto text-xs px-2.5 py-1 bg-[#F4F4F6] text-[#111111] border border-[#E5E5E5] rounded-full font-mono">
                      {INDUSTRY_TEMPLATES[formData.selectedIndustryKey]?.badge || 'Adaptive'} Vertical
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Monthly Target */}
                    <div>
                      <label className="block font-medium text-[#404040] mb-1.5">Monthly Pipeline Target</label>
                      <input 
                        type="text"
                        value={formData.targetMonthlyRevenue}
                        onChange={(e) => setFormData({ ...formData, targetMonthlyRevenue: e.target.value })}
                        placeholder="₹25,00,000"
                        className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2.5 text-[#111111] font-mono text-sm font-semibold outline-none transition"
                      />
                    </div>

                    {/* Pipeline Stage Preview */}
                    <div>
                      <label className="block font-medium text-[#404040] mb-2">Deal Pipeline Stages</label>
                      <div className="space-y-2">
                        {formData.pipelineStages.map((stage, idx) => (
                          <div 
                            key={stage.id} 
                            className="flex items-center justify-between p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-mono">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-[#111111]">{stage.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-mono text-[#666666]">Win Probability:</span>
                              <span className="font-mono font-bold text-[#16A34A] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                {stage.probability}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: INVITE TEAM */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                      Invite Team Members
                    </h2>
                    <p className="text-xs text-[#666666] mt-1">
                      Add your sales reps, account executives, and billing managers to this workspace.
                    </p>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {formData.teamInvites.map((invite, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-8">
                          <input 
                            type="email"
                            value={invite.email}
                            onChange={(e) => {
                              const updated = [...formData.teamInvites];
                              updated[index].email = e.target.value;
                              setFormData({ ...formData, teamInvites: updated });
                            }}
                            placeholder="colleague@yourcompany.com"
                            className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none transition"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <select 
                            value={invite.role}
                            onChange={(e) => {
                              const updated = [...formData.teamInvites];
                              updated[index].role = e.target.value;
                              setFormData({ ...formData, teamInvites: updated });
                            }}
                            className="w-full bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg px-3 py-2 text-[#111111] outline-none transition"
                          >
                            <option>Sales Rep</option>
                            <option>Sales Manager</option>
                            <option>Billing Admin</option>
                            <option>Workspace Admin</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addTeamMember}
                      className="text-xs text-[#111111] font-semibold hover:underline flex items-center space-x-1 pt-1"
                    >
                      <span>+ Add another team member</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & LAUNCH */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                      Ready to Launch Your Command Center
                    </h2>
                    <p className="text-xs text-[#666666] mt-1">
                      Review your configured setup. All settings are live and can be customized at any time in Settings.
                    </p>
                  </div>

                  {/* Summary Checklist */}
                  <div className="space-y-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl p-4 sm:p-5 text-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                      <span className="text-[#666666]">Organization</span>
                      <span className="font-bold text-[#111111]">{formData.companyName || organization?.name || 'Workspace'}</span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                      <span className="text-[#666666]">Business Type</span>
                      <span className="font-medium text-[#111111]">{formData.businessType}</span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                      <span className="text-[#666666]">Industry Vertical</span>
                      <span className="font-medium text-[#111111]">{formData.industry}</span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                      <span className="text-[#666666]">Office Location</span>
                      <span className="font-medium text-[#111111]">
                        {[formData.city, formData.state].filter(Boolean).join(', ') || 'Configured'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
                      <span className="text-[#666666]">Selected Plan</span>
                      <span className="font-semibold text-[#111111] capitalize">{formData.selectedPlan}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#666666]">Monthly Revenue Target</span>
                      <span className="font-mono font-bold text-[#111111]">{formData.targetMonthlyRevenue}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Stepper Actions */}
            <div className="pt-6 border-t border-[#E5E5E5] mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                className="px-4 py-2.5 border border-[#D4D4D4] hover:bg-[#F8F8F8] disabled:opacity-30 disabled:pointer-events-none rounded-lg text-xs font-medium text-[#404040] transition flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#111111] hover:bg-[#262626] active:scale-[0.99] text-white rounded-lg text-xs font-medium transition flex items-center space-x-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
              >
                <span>
                  {isSubmitting 
                    ? 'Launching Workspace...' 
                    : currentStep === 6 
                    ? 'Launch CRM Command Center' 
                    : 'Continue'}
                </span>
                {!isSubmitting && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#888888] border-t border-[#E5E5E5] bg-white">
        Zyvo Enterprise CRM • Strict Multi-Tenant Isolation & Role-Based Security
      </footer>
    </div>
  );
}

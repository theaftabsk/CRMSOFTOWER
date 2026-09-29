'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ChevronRight, CheckCircle2, AlertCircle, 
  Wallet, MapPin, Users, Send, Eye, Building2, Phone, Mail, 
  Image as ImageIcon, Video, Upload, X, MessageSquare, Target, 
  Search, Plus, Trash2, Sliders, FileText, Check, ShieldCheck,
  Briefcase, GraduationCap, Stethoscope, TrendingUp, Car, Home,
  Folder, User
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

// Categorized audience interests without any emojis - pure professional text
const INTEREST_CATEGORIES: { category: string; interests: string[] }[] = [
  {
    category: 'Real Estate & Property',
    interests: [
      'Real Estate & Property Buyers',
      'Luxury Apartments & Condominiums',
      'First-Time Home Buyers',
      'Commercial Property & Offices',
      'Interior Design & Home Improvement',
      'Vacation Homes & Land Plots',
    ],
  },
  {
    category: 'Business & Founders',
    interests: [
      'Small Business Owners & Entrepreneurs',
      'CEOs, Directors & Decision Makers',
      'B2B Corporate Software & Technology',
      'Digital Marketing & Advertising Agencies',
      'Manufacturing & Wholesale Businesses',
      'Franchise & Retail Business Seekers',
    ],
  },
  {
    category: 'Education & Career',
    interests: [
      'College & University Students',
      'Competitive Exam Aspirants',
      'Study Abroad & Overseas Education',
      'Professional Skills & IT Certification',
      'Parents of School-Age Children',
    ],
  },
  {
    category: 'Healthcare & Medical',
    interests: [
      'Physicians, Doctors & Surgeons',
      'Hospital & Diagnostic Clinic Owners',
      'Health, Fitness & Wellness',
      'Dental Care & Aesthetic Treatments',
    ],
  },
  {
    category: 'Finance & Investments',
    interests: [
      'Stock Market & Mutual Fund Investors',
      'High Net Worth Individuals',
      'Life & Health Insurance Seekers',
      'Business & Commercial Loan Seekers',
    ],
  },
  {
    category: 'Automobile & Luxury',
    interests: [
      'Luxury SUVs & Premium Vehicles',
      'Electric Vehicles (EV) Buyers',
      'Commercial Fleets & Transport Logistics',
      'Luxury Retail & Premium Goods',
    ],
  },
];

export default function CreateMetaCampaignPage() {
  const router = useRouter();

  // Wizard Step: 1, 2, or 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Right-hand Preview Mode: 'FEED' or 'FORM'
  const [previewMode, setPreviewMode] = useState<'FEED' | 'FORM'>('FEED');

  // Available Meta Assets from API
  const [availableAssets, setAvailableAssets] = useState<{
    adAccounts: any[];
    pages: any[];
    instagramAccounts: any[];
  }>({
    adAccounts: [],
    pages: [],
    instagramAccounts: [],
  });

  const [leadForms, setLeadForms] = useState<any[]>([]);

  // Locations array
  const [locations, setLocations] = useState<string[]>(['Kolkata', 'Howrah']);
  const [newLocationInput, setNewLocationInput] = useState('');

  // Selected Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Real Estate & Property Buyers',
    'Luxury Apartments & Condominiums',
  ]);
  const [activeInterestCategory, setActiveInterestCategory] = useState<string>('All');
  const [interestSearchQuery, setInterestSearchQuery] = useState('');
  const [customInterestInput, setCustomInterestInput] = useState('');

  // Form Mode: 'STANDARD' (3 questions), 'CUSTOM' (custom fields + questions), or 'EXISTING'
  const [formMode, setFormMode] = useState<'STANDARD' | 'CUSTOM' | 'EXISTING'>('STANDARD');

  // Custom Lead Form State
  const [customFormTitle, setCustomFormTitle] = useState('Get Project Brochure & Pricing Details');
  const [customFormIntro, setCustomFormIntro] = useState('Please confirm your contact details below to receive full project pricing and arrange a site visit.');
  const [additionalFields, setAdditionalFields] = useState<{
    city: boolean;
    company: boolean;
    budget: boolean;
  }>({
    city: true,
    company: false,
    budget: true,
  });

  // Custom Questions
  const [customQuestions, setCustomQuestions] = useState<Array<{ id: string; question: string }>>([
    { id: 'q1', question: 'Requirement: 2BHK, 3BHK or Villa?' },
    { id: 'q2', question: 'Expected timeline: Immediate or 1-3 Months?' },
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Main Form Data State (ZERO fake links, media_url starts completely empty)
  const [formData, setFormData] = useState({
    name: 'Lead Generation Campaign',
    objective: 'OUTCOME_LEADS' as const,
    page_id: '',
    page_name: '',
    page_picture: '',
    ad_account_id: '',
    ad_account_name: '',
    ad_account_balance: 0,
    ad_account_currency: 'INR',

    daily_budget: 500,
    target_age_min: 22,
    target_age_max: 55,
    target_gender: 'ALL',

    media_type: 'IMAGE' as 'IMAGE' | 'VIDEO',
    media_url: '',
    media_file_name: '',
    headline: 'Schedule a Consultation | Limited Slots Available',
    primary_text: 'Connect with our team to discover tailored solutions, transparent pricing, and comprehensive support. Request your callback today.',
    call_to_action: 'APPLY_NOW',
    lead_form_id: 'standard_3_question',
    lead_form_name: 'Standard Instant Lead Form',
  });

  // Load connected assets and forms
  useEffect(() => {
    async function initData() {
      try {
        setIsLoadingAssets(true);
        const [conn, assets, forms] = await Promise.all([
          api.getMetaConnection().catch(() => null),
          api.getMetaAssets().catch(() => ({ adAccounts: [], pages: [], instagramAccounts: [] })),
          api.getMetaLeadForms().catch(() => []),
        ]);

        const adAccs = Array.isArray(assets?.adAccounts) ? assets.adAccounts : [];
        const pgs = Array.isArray(assets?.pages) ? assets.pages : [];
        const fms = Array.isArray(forms) ? forms : [];

        setAvailableAssets({
          adAccounts: adAccs,
          pages: pgs,
          instagramAccounts: Array.isArray(assets?.instagramAccounts) ? assets.instagramAccounts : [],
        });
        setLeadForms(fms);

        // Pre-fill active connected assets
        const activeAdAccount = adAccs.find((a: any) => a.id === conn?.config?.ad_account_id) || adAccs[0];
        const activePage = pgs.find((p: any) => p.id === conn?.config?.page_id) || pgs[0];

        setFormData((prev) => ({
          ...prev,
          page_id: activePage?.id || conn?.config?.page_id || '',
          page_name: activePage?.name || conn?.config?.page_name || 'Primary Page',
          page_picture: activePage?.picture || conn?.config?.page_picture || '',
          ad_account_id: activeAdAccount?.id || conn?.config?.ad_account_id || '',
          ad_account_name: activeAdAccount?.name || conn?.config?.ad_account_name || 'Ad Account',
          ad_account_balance: activeAdAccount?.balance ? Number(activeAdAccount.balance) / 100 : 0,
          ad_account_currency: activeAdAccount?.currency || conn?.config?.currency || 'INR',
        }));
      } catch (err) {
        console.error('Failed to initialize Meta assets:', err);
      } finally {
        setIsLoadingAssets(false);
      }
    }

    initData();
  }, []);

  // Budget calculations
  const calculateEstimatedMetrics = (budget: number) => {
    const minReach = Math.floor(budget * 25);
    const maxReach = Math.floor(budget * 65);
    const minLeads = Math.max(2, Math.floor(budget / 35));
    const maxLeads = Math.max(5, Math.floor(budget / 18));
    const cplMin = Math.round(budget / maxLeads);
    const cplMax = Math.round(budget / minLeads);
    return {
      reach: `${minReach.toLocaleString('en-IN')} - ${maxReach.toLocaleString('en-IN')}`,
      leads: `${minLeads} - ${maxLeads}`,
      cpl: `₹${cplMin} - ₹${cplMax}`,
    };
  };

  const metrics = calculateEstimatedMetrics(formData.daily_budget);

  // Locations management
  const handleAddLocation = (loc: string) => {
    const clean = loc.trim();
    if (clean && !locations.includes(clean)) {
      setLocations([...locations, clean]);
    }
    setNewLocationInput('');
  };

  const handleRemoveLocation = (locToRemove: string) => {
    setLocations(locations.filter((l) => l !== locToRemove));
  };

  // Interests management
  const handleToggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleAddCustomInterest = () => {
    const clean = customInterestInput.trim();
    if (clean && !selectedInterests.includes(clean)) {
      setSelectedInterests([...selectedInterests, clean]);
      setCustomInterestInput('');
    }
  };

  // Custom questions management
  const handleAddQuestion = () => {
    const clean = newQuestionText.trim();
    if (clean) {
      setCustomQuestions([
        ...customQuestions,
        { id: `q_${Date.now()}`, question: clean }
      ]);
      setNewQuestionText('');
    }
  };

  const handleRemoveQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  // Real File upload for Image / Video
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video');

    setFormData((prev) => ({
      ...prev,
      media_type: isVideo ? 'VIDEO' : 'IMAGE',
      media_url: objectUrl,
      media_file_name: file.name,
    }));
  };

  const handleClearMedia = () => {
    setFormData((prev) => ({
      ...prev,
      media_url: '',
      media_file_name: '',
    }));
  };

  // Launch campaign
  const handleLaunchCampaign = async () => {
    if (!formData.name.trim()) {
      setErrorMessage('Please provide a campaign name.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const formFieldsList = ['full_name', 'phone_number', 'email'];
      if (formMode === 'CUSTOM') {
        if (additionalFields.city) formFieldsList.push('city');
        if (additionalFields.company) formFieldsList.push('company');
        if (additionalFields.budget) formFieldsList.push('budget');
      }

      const payload = {
        name: formData.name,
        objective: formData.objective,
        daily_budget: formData.daily_budget,
        target_location: locations.join(', ') || 'All India',
        target_age_min: formData.target_age_min,
        target_age_max: formData.target_age_max,
        target_gender: formData.target_gender,
        target_interests: selectedInterests,
        page_id: formData.page_id,
        page_name: formData.page_name,
        page_picture: formData.page_picture,
        ad_account_id: formData.ad_account_id,
        ad_account_name: formData.ad_account_name,
        headline: formData.headline,
        primary_text: formData.primary_text,
        call_to_action: formData.call_to_action,
        lead_form_id: formMode === 'EXISTING' ? formData.lead_form_id : (formMode === 'CUSTOM' ? 'custom_instant_form' : 'standard_3_question'),
        lead_form_name: formMode === 'CUSTOM' ? customFormTitle : formData.lead_form_name,
        form_intro: customFormIntro,
        form_fields: formFieldsList,
        custom_questions: formMode === 'CUSTOM' ? customQuestions : [],
        media_url: formData.media_url,
        media_type: formData.media_type,
      };

      const result = await api.createMetaCampaign(payload);
      if (result) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push('/meta-ads/campaigns');
        }, 1500);
      } else {
        setErrorMessage('Failed to create campaign. Please verify your connection status.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while publishing campaign.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCtaLabel = (key: string) => {
    switch (key) {
      case 'APPLY_NOW': return 'Apply Now';
      case 'BOOK_NOW': return 'Book Now';
      case 'CONTACT_US': return 'Contact Us';
      case 'GET_QUOTE': return 'Get Quote';
      case 'LEARN_MORE': return 'Learn More';
      case 'SIGN_UP': return 'Sign Up';
      case 'WHATSAPP_MESSAGE': return 'WhatsApp Message';
      default: return 'Apply Now';
    }
  };

  // Filtered interests
  const allInterests = INTEREST_CATEGORIES.flatMap(c => c.interests);
  const displayedInterests = (activeInterestCategory === 'All'
    ? allInterests
    : (INTEREST_CATEGORIES.find(c => c.category === activeInterestCategory)?.interests || [])
  ).filter(i => i.toLowerCase().includes(interestSearchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <Link 
              href="/meta-ads/campaigns"
              className="p-1.5 rounded-lg border border-[#E5E5E5] text-[#666666] hover:text-[#111111] hover:bg-[#F8F8F8] transition"
              title="Back to Campaigns"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
              Create Meta Lead Campaign
            </h1>
            <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              3-Step Wizard
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Launch targeted Facebook and Instagram Lead Ads with verified forms synced directly into Zyvo CRM.
          </p>
        </div>

        <Link
          href="/meta-ads/campaigns"
          className="inline-flex items-center text-xs text-[#666666] hover:text-[#111111] font-medium"
        >
          Cancel and return
        </Link>
      </div>

      {/* Step Indicator Bar */}
      <div className="grid grid-cols-3 gap-3 bg-white p-2 rounded-xl border border-[#E5E5E5] shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => setCurrentStep(1)}
          className={`flex items-center justify-center sm:justify-start px-4 py-2.5 rounded-lg text-xs font-semibold transition ${
            currentStep === 1
              ? 'bg-[#111111] text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F8F8F8] hover:text-[#111111]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-[10px] font-mono ${
            currentStep === 1 ? 'bg-white text-[#111111] font-bold' : 'border border-[#D4D4D4]'
          }`}>
            1
          </span>
          <span className="truncate">1. Goal & Identity</span>
        </button>

        <button
          onClick={() => setCurrentStep(2)}
          className={`flex items-center justify-center sm:justify-start px-4 py-2.5 rounded-lg text-xs font-semibold transition ${
            currentStep === 2
              ? 'bg-[#111111] text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F8F8F8] hover:text-[#111111]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-[10px] font-mono ${
            currentStep === 2 ? 'bg-white text-[#111111] font-bold' : 'border border-[#D4D4D4]'
          }`}>
            2
          </span>
          <span className="truncate">2. Budget & Audience</span>
        </button>

        <button
          onClick={() => setCurrentStep(3)}
          className={`flex items-center justify-center sm:justify-start px-4 py-2.5 rounded-lg text-xs font-semibold transition ${
            currentStep === 3
              ? 'bg-[#111111] text-white shadow-xs'
              : 'text-[#666666] hover:bg-[#F8F8F8] hover:text-[#111111]'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-[10px] font-mono ${
            currentStep === 3 ? 'bg-white text-[#111111] font-bold' : 'border border-[#D4D4D4]'
          }`}>
            3
          </span>
          <span className="truncate">3. Creative & Form</span>
        </button>
      </div>

      {/* Main Grid: Wizard Form on Left (7 cols), Live Ad/Form Preview on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Body */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E5E5E5] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          {errorMessage && (
            <div className="flex items-center space-x-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">Campaign Published Successfully! Redirecting to list...</span>
            </div>
          )}

          {/* STEP 1: CAMPAIGN IDENTITY & ACCOUNTS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-[#111111]">1. Campaign Goal & Selected Assets</h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Select your Facebook Page, target Ad Account with available balance, and name your campaign.
                </p>
              </div>

              {/* Campaign Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Residential Apartments Q4 Lead Campaign"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                />
              </div>

              {/* Goal Objective */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Campaign Objective</label>
                <div className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#111111]">Generate High-Intent Leads</div>
                      <div className="text-[11px] text-[#666666]">Optimized for Instant Lead Forms on Facebook and Instagram</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    OUTCOME_LEADS
                  </span>
                </div>
              </div>

              {/* Select Facebook Page */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">Selected Facebook Page</label>
                  <span className="text-[11px] text-[#666666]">
                    {availableAssets.pages.length} Available
                  </span>
                </div>
                {availableAssets.pages.length > 0 ? (
                  <select
                    value={formData.page_id}
                    onChange={(e) => {
                      const sel = availableAssets.pages.find((p) => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        page_id: e.target.value,
                        page_name: sel?.name || 'Selected Page',
                        page_picture: sel?.picture || '',
                      });
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                  >
                    {availableAssets.pages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (ID: {p.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.page_name}
                    onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                    placeholder="Enter Facebook Page Name"
                  />
                )}
              </div>

              {/* Select Ad Account & Balance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">Charging Ad Account</label>
                  <span className="text-[11px] text-[#666666]">
                    {availableAssets.adAccounts.length} Available
                  </span>
                </div>
                {availableAssets.adAccounts.length > 0 ? (
                  <select
                    value={formData.ad_account_id}
                    onChange={(e) => {
                      const sel = availableAssets.adAccounts.find((a) => a.id === e.target.value);
                      setFormData({
                        ...formData,
                        ad_account_id: e.target.value,
                        ad_account_name: sel?.name || 'Selected Ad Account',
                        ad_account_balance: sel?.balance ? Number(sel.balance) / 100 : 0,
                        ad_account_currency: sel?.currency || 'INR',
                      });
                    }}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                  >
                    {availableAssets.adAccounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.id}) - {a.currency}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.ad_account_name}
                    onChange={(e) => setFormData({ ...formData, ad_account_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                    placeholder="Enter Ad Account Name or ID"
                  />
                )}
                <div className="flex items-center justify-between text-[11px] text-[#666666] pt-1 px-1">
                  <span className="flex items-center">
                    <Wallet className="w-3.5 h-3.5 mr-1 text-[#111111]" />
                    Ad Account Live Balance:
                  </span>
                  <span className="font-mono font-bold text-[#111111]" suppressHydrationWarning>
                    ₹{formatNumber(formData.ad_account_balance)} {formData.ad_account_currency}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: AUDIENCE TARGETING & DAILY BUDGET */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-[#111111]">2. Target Audience & Daily Budget</h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Set daily budget, multi-city target locations, demographics, and customer interest personas.
                </p>
              </div>

              {/* Daily Budget Selector with Live Forecast */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">Daily Budget (INR)</label>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Est. {metrics.leads} Leads / day
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[300, 500, 1000, 2500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setFormData({ ...formData, daily_budget: amt })}
                      className={`py-2 px-3 rounded-lg border text-xs font-mono font-semibold transition ${
                        formData.daily_budget === amt
                          ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                          : 'border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F8F8F8]'
                      }`}
                    >
                      ₹{amt}/day
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={formData.daily_budget}
                    onChange={(e) => setFormData({ ...formData, daily_budget: Number(e.target.value) || 100 })}
                    className="w-full px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                    placeholder="Enter custom daily budget (e.g. 5000)"
                  />
                </div>

                {/* Realtime Reach Metrics Banner */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] text-center mt-2">
                  <div>
                    <div className="text-[10px] text-[#666666]">Estimated Daily Reach</div>
                    <div className="text-xs font-mono font-bold text-[#111111] mt-0.5">{metrics.reach}</div>
                  </div>
                  <div className="border-x border-[#E5E5E5]">
                    <div className="text-[10px] text-[#666666]">Estimated Leads</div>
                    <div className="text-xs font-mono font-bold text-emerald-600 mt-0.5">{metrics.leads}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#666666]">Estimated CPL</div>
                    <div className="text-xs font-mono font-bold text-[#111111] mt-0.5">{metrics.cpl}</div>
                  </div>
                </div>
              </div>

              {/* Multi-Location Targeting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111] flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    Target Locations ({locations.length} Selected)
                  </label>
                  <span className="text-[10px] text-[#666666]">Add multiple cities or regions</span>
                </div>

                {/* Selected Location Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] min-h-[42px] items-center">
                  {locations.map((loc) => (
                    <span 
                      key={loc}
                      className="inline-flex items-center text-xs font-medium bg-white text-[#111111] px-2.5 py-1 rounded-md border border-[#D4D4D4] shadow-2xs"
                    >
                      <span>{loc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(loc)}
                        className="ml-1.5 p-0.5 hover:bg-[#F0F0F0] rounded text-[#666666] hover:text-rose-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center space-x-1 flex-1 min-w-[140px]">
                    <input
                      type="text"
                      value={newLocationInput}
                      onChange={(e) => setNewLocationInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLocation(newLocationInput);
                        }
                      }}
                      placeholder="+ Type city and press Enter"
                      className="w-full text-xs bg-transparent focus:outline-none px-1.5 py-0.5 text-[#111111]"
                    />
                    {newLocationInput && (
                      <button
                        type="button"
                        onClick={() => handleAddLocation(newLocationInput)}
                        className="text-[11px] font-semibold text-[#111111] px-2 py-0.5 rounded bg-[#E5E5E5] hover:bg-[#D4D4D4]"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>

                {/* Popular City Quick Add Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Delhi NCR', 'Mumbai', 'Bangalore', 'All India'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleAddLocation(city)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition ${
                        locations.includes(city)
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : 'border-[#E5E5E5] bg-[#F8F8F8] text-[#666666] hover:text-[#111111]'
                      }`}
                    >
                      {locations.includes(city) ? '✓ ' : '+ '}{city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Range & Demographics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#111111]">Min Age</label>
                  <select
                    value={formData.target_age_min}
                    onChange={(e) => setFormData({ ...formData, target_age_min: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                  >
                    {[18, 20, 22, 25, 28, 30, 35].map((age) => (
                      <option key={age} value={age}>{age} Years</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#111111]">Max Age</label>
                  <select
                    value={formData.target_age_max}
                    onChange={(e) => setFormData({ ...formData, target_age_max: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                  >
                    {[40, 45, 50, 55, 60, 65].map((age) => (
                      <option key={age} value={age}>{age} Years</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1" />
                  Target Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'ALL', label: 'All Genders' },
                    { key: 'MEN', label: 'Men' },
                    { key: 'WOMEN', label: 'Women' },
                  ].map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, target_gender: g.key })}
                      className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                        formData.target_gender === g.key
                          ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                          : 'border-[#E5E5E5] bg-white text-[#666666] hover:bg-[#F8F8F8] hover:text-[#111111]'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DETAILED AUDIENCE INTERESTS (100% Clean Text - Zero Emojis) */}
              <div className="space-y-3 pt-3 border-t border-[#E5E5E5]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-[#111111] flex items-center">
                      <Target className="w-3.5 h-3.5 mr-1.5 text-[#111111]" />
                      Audience Interests ({selectedInterests.length} Selected)
                    </label>
                    <p className="text-[11px] text-[#666666] mt-0.5">
                      Target specific customer profiles and high-intent buying segments.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#999999]" />
                    <input
                      type="text"
                      value={interestSearchQuery}
                      onChange={(e) => setInterestSearchQuery(e.target.value)}
                      placeholder="Search interests..."
                      className="text-xs pl-8 pr-3 py-1 rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white w-44"
                    />
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1 pb-1">
                  {['All', 'Real Estate & Property', 'Business & Founders', 'Education & Career', 'Healthcare & Medical', 'Finance & Investments', 'Automobile & Luxury'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveInterestCategory(cat)}
                      className={`text-[11px] px-2.5 py-1 rounded-md transition ${
                        activeInterestCategory === cat
                          ? 'bg-[#111111] text-white font-semibold shadow-2xs'
                          : 'bg-[#F8F8F8] text-[#666666] hover:bg-[#E5E5E5] hover:text-[#111111]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Interests Chips Grid */}
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA]">
                  {displayedInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center ${
                        selectedInterests.includes(interest)
                          ? 'border-[#111111] bg-[#111111] text-white font-medium shadow-xs'
                          : 'border-[#D4D4D4] bg-white text-[#666666] hover:border-[#111111] hover:text-[#111111]'
                      }`}
                    >
                      {selectedInterests.includes(interest) && (
                        <Check className="w-3 h-3 mr-1 text-emerald-400" />
                      )}
                      <span>{interest}</span>
                    </button>
                  ))}
                </div>

                {/* Add Custom Interest Input */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={customInterestInput}
                    onChange={(e) => setCustomInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomInterest();
                      }
                    }}
                    placeholder="+ Add custom audience keyword (e.g. NRI Investors, Commercial Hubs)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomInterest}
                    disabled={!customInterestInput.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-semibold disabled:opacity-50 hover:bg-[#262626] transition shadow-xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CREATIVE & INSTANT LEAD FORM */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-[#111111]">3. Ad Creative & Instant Lead Form</h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Upload an image or video, write your copy, choose a CTA button, and configure the lead capture form.
                </p>
              </div>

              {/* Media Type Toggle: Image vs Video */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">Ad Media Format</label>
                  <span className="text-[11px] text-[#666666]">
                    Supported formats: PNG, JPG, MP4, WebM
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, media_type: 'IMAGE' })}
                    className={`py-2.5 px-4 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                      formData.media_type === 'IMAGE'
                        ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                        : 'border-[#E5E5E5] bg-white text-[#666666] hover:bg-[#F8F8F8] hover:text-[#111111]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Single Image / Photo Ad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, media_type: 'VIDEO' })}
                    className={`py-2.5 px-4 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                      formData.media_type === 'VIDEO'
                        ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                        : 'border-[#E5E5E5] bg-white text-[#666666] hover:bg-[#F8F8F8] hover:text-[#111111]'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video / Reel Ad</span>
                  </button>
                </div>

                {/* Pure Real Local File Upload - ZERO fake links */}
                <div className="p-4 rounded-xl border border-dashed border-[#D4D4D4] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 text-xs text-[#111111]">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-center shrink-0">
                      {formData.media_type === 'VIDEO' ? (
                        <Video className="w-5 h-5 text-[#111111]" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-[#111111]" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {formData.media_file_name 
                          ? formData.media_file_name 
                          : `Upload ${formData.media_type === 'VIDEO' ? 'Video Ad (.mp4, .webm)' : 'Photo Ad (.jpg, .png)'}`}
                      </div>
                      <div className="text-[11px] text-[#666666]">
                        {formData.media_file_name 
                          ? 'Real file attached for ad campaign' 
                          : 'Maximum 25MB • Recommended size 1080x1080 or 1080x1350'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {formData.media_file_name && (
                      <button
                        type="button"
                        onClick={handleClearMedia}
                        className="px-3 py-1.5 rounded-lg border border-[#D4D4D4] bg-white text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        Remove
                      </button>
                    )}
                    <label className="cursor-pointer px-4 py-2 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#262626] transition shadow-xs">
                      {formData.media_file_name ? 'Change File' : 'Choose Local File'}
                      <input
                        type="file"
                        accept={formData.media_type === 'VIDEO' ? 'video/mp4,video/webm' : 'image/*'}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Primary Text / Ad Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Primary Text (Ad Caption)</label>
                <textarea
                  rows={3}
                  value={formData.primary_text}
                  onChange={(e) => setFormData({ ...formData, primary_text: e.target.value })}
                  placeholder="Enter your ad copy, value proposition, and key details..."
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                />
              </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Ad Headline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Schedule a Site Visit | Limited Slots Left"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                />
              </div>

              {/* Call To Action Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Call To Action Button</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { key: 'APPLY_NOW', label: 'Apply Now' },
                    { key: 'BOOK_NOW', label: 'Book Now' },
                    { key: 'CONTACT_US', label: 'Contact Us' },
                    { key: 'GET_QUOTE', label: 'Get Quote' },
                    { key: 'LEARN_MORE', label: 'Learn More' },
                    { key: 'SIGN_UP', label: 'Sign Up' },
                    { key: 'WHATSAPP_MESSAGE', label: 'WhatsApp' },
                  ].map((cta) => (
                    <button
                      key={cta.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, call_to_action: cta.key })}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition text-center truncate ${
                        formData.call_to_action === cta.key
                          ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                          : 'border-[#E5E5E5] bg-white text-[#666666] hover:bg-[#F8F8F8] hover:text-[#111111]'
                      }`}
                    >
                      {cta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LEAD FORM BUILDER & DIRECT CRM PIPELINE */}
              <div className="space-y-4 pt-3 border-t border-[#E5E5E5]">
                {/* DIRECT CRM GUARANTEE BANNER */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start space-x-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Direct CRM Integration Guaranteed: </span>
                    Every lead submitted through this form decrypts in realtime via Meta Webhook and lands in your Zyvo CRM Leads table (<span className="font-mono">&lt; 500ms</span>) with round-robin rep assignment and sound alert.
                  </div>
                </div>

                {/* Form Mode Tabs */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#111111]">Instant Lead Form Configuration</label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(previewMode === 'FORM' ? 'FEED' : 'FORM')}
                    className="text-xs text-[#111111] hover:underline font-semibold flex items-center"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    {previewMode === 'FORM' ? 'View Feed Ad Preview' : 'Preview Form Popup'}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 p-1 bg-[#F4F4F5] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormMode('STANDARD')}
                    className={`py-2 px-2.5 rounded-md text-xs font-semibold transition text-center ${
                      formMode === 'STANDARD'
                        ? 'bg-white text-[#111111] shadow-2xs'
                        : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    Standard Form (3-Fields)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode('CUSTOM')}
                    className={`py-2 px-2.5 rounded-md text-xs font-semibold transition text-center ${
                      formMode === 'CUSTOM'
                        ? 'bg-white text-[#111111] shadow-2xs'
                        : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    Custom Form Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode('EXISTING')}
                    className={`py-2 px-2.5 rounded-md text-xs font-semibold transition text-center ${
                      formMode === 'EXISTING'
                        ? 'bg-white text-[#111111] shadow-2xs'
                        : 'text-[#666666] hover:text-[#111111]'
                    }`}
                  >
                    Existing Page Forms ({leadForms.length})
                  </button>
                </div>

                {/* MODE 1: STANDARD 3-QUESTION FORM */}
                {formMode === 'STANDARD' && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-[#111111]">
                          Standard Instant Lead Form (Highest Conversion Rate)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Automatically pre-populates with the prospective customer&apos;s verified Facebook profile credentials (Zero manual typing for prospect):
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-[#111111] font-medium">
                      <div className="p-2.5 rounded-lg bg-white border border-[#E5E5E5] flex items-center space-x-2 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Full Name</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#E5E5E5] flex items-center space-x-2 shadow-2xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Phone Number</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-[#E5E5E5] flex items-center space-x-2 shadow-2xs">
                        <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Email Address</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 2: CUSTOM LEAD FORM BUILDER */}
                {formMode === 'CUSTOM' && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111111] flex items-center">
                        <Sliders className="w-4 h-4 mr-1.5 text-[#111111]" />
                        Customize Form Fields & Qualifying Questions
                      </span>
                      <span className="text-[10px] font-mono bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded font-semibold">
                        Custom Leadgen
                      </span>
                    </div>

                    {/* Form Title & Description */}
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#111111]">Form Header Title</label>
                        <input
                          type="text"
                          value={customFormTitle}
                          onChange={(e) => setCustomFormTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[#111111]">Form Greeting / Intro Note</label>
                        <input
                          type="text"
                          value={customFormIntro}
                          onChange={(e) => setCustomFormIntro(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Additional CRM Fields */}
                    <div className="space-y-1.5 pt-2 border-t border-[#E5E5E5]">
                      <label className="text-[11px] font-semibold text-[#111111]">Optional Direct CRM Contact Fields:</label>
                      <div className="grid grid-cols-3 gap-2">
                        <label className="p-2 rounded-lg bg-white border border-[#E5E5E5] flex items-center space-x-2 text-xs text-[#111111] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={additionalFields.city}
                            onChange={(e) => setAdditionalFields({ ...additionalFields, city: e.target.checked })}
                            className="rounded border-[#D4D4D4]"
                          />
                          <span>City / Location</span>
                        </label>
                        <label className="p-2 rounded-lg bg-white border border-[#E5E5E5] flex items-center space-x-2 text-xs text-[#111111] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={additionalFields.company}
                            onChange={(e) => setAdditionalFields({ ...additionalFields, company: e.target.checked })}
                            className="rounded border-[#D4D4D4]"
                          />
                          <span>Company Name</span>
                        </label>
                        <label className="p-2 rounded-lg bg-white border border-[#E5E5E5] flex items-center space-x-2 text-xs text-[#111111] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={additionalFields.budget}
                            onChange={(e) => setAdditionalFields({ ...additionalFields, budget: e.target.checked })}
                            className="rounded border-[#D4D4D4]"
                          />
                          <span>Budget / Capacity</span>
                        </label>
                      </div>
                    </div>

                    {/* Custom Qualifying Questions */}
                    <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                      <label className="text-[11px] font-semibold text-[#111111] flex items-center justify-between">
                        <span>Custom Qualifying Questions ({customQuestions.length})</span>
                        <span className="text-[10px] text-[#666666]">Saved in Lead Notes on CRM</span>
                      </label>

                      {/* Question list */}
                      <div className="space-y-1.5">
                        {customQuestions.map((q, idx) => (
                          <div key={q.id} className="p-2 rounded-lg bg-white border border-[#E5E5E5] flex items-center justify-between shadow-2xs">
                            <div className="text-xs text-[#111111] flex items-center space-x-2">
                              <span className="font-mono text-[10px] font-bold text-[#666666]">Q{idx + 1}.</span>
                              <span className="font-medium">{q.question}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id)}
                              className="text-[#999999] hover:text-rose-600 p-1 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add new question */}
                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="text"
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddQuestion();
                            }
                          }}
                          placeholder="e.g. Which project location are you interested in?"
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                        />
                        <button
                          type="button"
                          onClick={handleAddQuestion}
                          disabled={!newQuestionText.trim()}
                          className="px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#262626] transition shadow-xs disabled:opacity-50"
                        >
                          + Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 3: EXISTING FORMS */}
                {formMode === 'EXISTING' && (
                  <div className="p-4 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] space-y-3">
                    <label className="text-xs font-semibold text-[#111111]">Select Existing Facebook Page Form</label>
                    {leadForms.length > 0 ? (
                      <select
                        value={formData.lead_form_id}
                        onChange={(e) => {
                          const sel = leadForms.find((f) => f.id === e.target.value);
                          setFormData({
                            ...formData,
                            lead_form_id: e.target.value,
                            lead_form_name: sel?.name || 'Selected Lead Form',
                          });
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                      >
                        {leadForms.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} (Status: {f.status || 'ACTIVE'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs text-[#666666] p-3 border border-dashed border-[#D4D4D4] rounded-lg bg-white text-center">
                        No existing forms found on this Facebook Page. We will automatically create the Standard 3-Question Instant Form for your campaign.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wizard Action Controls */}
          <div className="flex items-center justify-between pt-5 border-t border-[#E5E5E5]">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-4 py-2 rounded-lg border border-[#D4D4D4] bg-white text-xs font-semibold text-[#111111] hover:bg-[#F8F8F8] transition"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="inline-flex items-center px-5 py-2 rounded-lg bg-[#111111] hover:bg-[#262626] text-white text-xs font-semibold transition shadow-xs"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunchCampaign}
                disabled={isSubmitting || submitSuccess}
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-[#111111] hover:bg-[#262626] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Publishing to Meta Graph API...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-2" />
                    Launch & Publish Campaign
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Toggleable Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            {/* Toggle Preview Buttons */}
            <div className="flex items-center space-x-1 bg-white border border-[#E5E5E5] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewMode('FEED')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 ${
                  previewMode === 'FEED'
                    ? 'bg-[#111111] text-white shadow-2xs'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Feed Ad</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('FORM')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center space-x-1.5 ${
                  previewMode === 'FORM'
                    ? 'bg-[#111111] text-white shadow-2xs'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Instant Form</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              LIVE PREVIEW
            </span>
          </div>

          {/* VIEW 1: MOBILE FEED AD PREVIEW */}
          {previewMode === 'FEED' && (
            <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.04)] animate-in fade-in duration-150">
              {/* Ad Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-[#F0F0F0]">
                <div className="flex items-center space-x-2.5">
                  {formData.page_picture ? (
                    <img
                      src={formData.page_picture}
                      alt={formData.page_name}
                      className="w-9 h-9 rounded-full object-cover border border-[#E5E5E5]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs">
                      {formData.page_name ? formData.page_name.charAt(0).toUpperCase() : 'P'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-[#111111] leading-tight">
                      {formData.page_name || 'Your Facebook Page'}
                    </div>
                    <div className="text-[10px] text-[#666666] flex items-center space-x-1 mt-0.5">
                      <span>Sponsored</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#999999]">•••</span>
              </div>

              {/* Ad Caption */}
              <div className="p-3.5 text-xs text-[#111111] leading-relaxed">
                {formData.primary_text || 'Your primary ad copy will appear here...'}
              </div>

              {/* Real Image or Video Ad Banner Preview (ZERO fake images) */}
              <div className="aspect-video bg-[#F8F8F8] border-y border-[#E5E5E5] relative overflow-hidden flex items-center justify-center">
                {formData.media_url ? (
                  formData.media_type === 'VIDEO' ? (
                    <video 
                      src={formData.media_url} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={formData.media_url} 
                      alt="Ad Creative" 
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[#999999]">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center mb-2.5 text-[#666666] shadow-2xs">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-semibold text-[#111111]">
                      Attach Photo or Video
                    </div>
                    <div className="text-[11px] text-[#666666] mt-1 max-w-[220px]">
                      Upload your real creative above to preview your ad
                    </div>
                  </div>
                )}
              </div>

              {/* Ad Action Footer */}
              <div className="p-3.5 bg-[#FAFAFA] flex items-center justify-between">
                <div className="truncate pr-2">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-[#666666] truncate">
                    {locations.join(', ') || 'Target Geo'}
                  </div>
                  <div className="text-xs font-bold text-[#111111] truncate mt-0.5">
                    {formData.headline || 'Headline goes here'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewMode('FORM')}
                  className={`shrink-0 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 ${
                    formData.call_to_action === 'WHATSAPP_MESSAGE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#111111] hover:bg-[#262626]'
                  }`}
                >
                  {formData.call_to_action === 'WHATSAPP_MESSAGE' && (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                  <span>{getCtaLabel(formData.call_to_action)}</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: INSTANT LEAD FORM POPUP PREVIEW */}
          {previewMode === 'FORM' && (
            <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.04)] animate-in fade-in duration-150">
              {/* Lead Form Header */}
              <div className="p-4 bg-[#111111] text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {formData.page_picture ? (
                    <img
                      src={formData.page_picture}
                      alt={formData.page_name}
                      className="w-8 h-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      {formData.page_name ? formData.page_name.charAt(0).toUpperCase() : 'P'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold leading-tight">{formData.page_name || 'Facebook Page'}</div>
                    <div className="text-[10px] text-zinc-300">Official Meta Lead Form</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-zinc-200">
                  Instant Sync
                </span>
              </div>

              {/* Form Body Preview */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">
                    {formMode === 'CUSTOM' ? customFormTitle : 'Get Instant Information & Pricing'}
                  </h3>
                  <p className="text-[11px] text-[#666666] mt-0.5">
                    {formMode === 'CUSTOM' ? customFormIntro : 'Please confirm your contact details below to receive instant information.'}
                  </p>
                </div>

                {/* Simulated Lead Fields */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">Full Name</label>
                    <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-medium text-[#111111]">
                      Rahul Sharma (Auto-filled by Meta)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">Phone Number</label>
                    <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-mono font-medium text-[#111111]">
                      +91 98301 23456 (Verified)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">Email Address</label>
                    <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-mono font-medium text-[#111111]">
                      rahul.sharma@gmail.com
                    </div>
                  </div>

                  {/* Optional Custom Fields */}
                  {formMode === 'CUSTOM' && additionalFields.city && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">City</label>
                      <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#666666]">
                        Kolkata, West Bengal
                      </div>
                    </div>
                  )}

                  {formMode === 'CUSTOM' && additionalFields.company && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">Company Name</label>
                      <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#666666]">
                        Acme Enterprises
                      </div>
                    </div>
                  )}

                  {formMode === 'CUSTOM' && additionalFields.budget && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">Budget / Investment</label>
                      <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs font-mono text-[#666666]">
                        ₹45 Lakhs - ₹75 Lakhs
                      </div>
                    </div>
                  )}

                  {/* Custom Questions */}
                  {formMode === 'CUSTOM' && customQuestions.map((q, idx) => (
                    <div key={q.id} className="space-y-1">
                      <label className="text-[10px] font-semibold text-[#666666] uppercase tracking-wider">
                        Question {idx + 1}: {q.question}
                      </label>
                      <div className="p-2 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] text-xs text-[#666666]">
                        Customer response will appear here...
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Footer */}
                <div className="pt-2 border-t border-[#E5E5E5] space-y-2">
                  <div className="text-[10px] text-[#999999] leading-tight flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Transfers directly to Zyvo CRM via Meta Webhook protocol.</span>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-lg bg-[#111111] text-white text-xs font-bold shadow-xs hover:bg-[#262626] transition"
                  >
                    Submit & Request Callback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Campaign Summary Card */}
          <div className="bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] p-4 text-xs space-y-2">
            <div className="font-semibold text-[#111111] pb-1 border-b border-[#E5E5E5] flex items-center justify-between">
              <span>Live Campaign Summary</span>
              <span className="font-mono text-[10px] text-emerald-700 font-bold">READY TO STREAM</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Ad Account:</span>
              <span className="font-mono font-medium text-[#111111]">{formData.ad_account_name || 'Default'}</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Daily Budget:</span>
              <span className="font-mono font-bold text-[#111111]" suppressHydrationWarning>
                ₹{formatNumber(formData.daily_budget)}/day
              </span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Target Locations:</span>
              <span className="font-medium text-[#111111] truncate max-w-[170px]" title={locations.join(', ')}>
                {locations.join(', ')}
              </span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Audience Personas:</span>
              <span className="font-mono text-[#111111]">{selectedInterests.length} Selected</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Form Configuration:</span>
              <span className="font-semibold text-[#111111]">
                {formMode === 'CUSTOM' ? `Custom Form (${customQuestions.length} Questions)` : 'Standard 3-Fields'}
              </span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Lead Sync Destination:</span>
              <span className="text-emerald-700 font-semibold">Zyvo CRM Leads Table</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

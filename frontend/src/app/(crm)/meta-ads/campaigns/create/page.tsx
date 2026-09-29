'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ChevronRight, CheckCircle2, AlertCircle, 
  Layers, Wallet, MapPin, Users, Sparkles, Send, 
  Eye, HelpCircle, Building2, Facebook, Phone, Mail, 
  UserCheck, Image as ImageIcon, Video, Upload, X, 
  MessageCircle, Target, Compass, Play, Plus
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

// Stock industry templates for instant preview
const SAMPLE_TEMPLATES = [
  {
    label: 'Real Estate / Property',
    media_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    media_type: 'IMAGE',
    headline: 'Luxury 3BHK Homes in Kolkata @ ₹45L',
    caption: 'Experience world-class living with zero brokerage, rooftop swimming pool, gym, and 24x7 security. Schedule a private site visit today!',
  },
  {
    label: 'Education / Coaching',
    media_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
    media_type: 'IMAGE',
    headline: 'Admissions Open 2026 | 100% Placement Support',
    caption: 'Enroll in premier industry-certified training programs with real-world live projects and expert mentoring. Enquire now for scholarship!',
  },
  {
    label: 'Corporate SaaS / Tech',
    media_url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1000&q=80',
    media_type: 'IMAGE',
    headline: 'Automate Sales & Marketing with Zyvo CRM',
    caption: 'Capture Facebook leads instantly, sync calls, and boost sales pipeline revenue by 3x. Start your 14-day free trial today.',
  },
  {
    label: 'Clinic / Healthcare',
    media_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    media_type: 'IMAGE',
    headline: 'Consult Top Specialists | Online & In-Clinic',
    caption: 'Advanced diagnostic care with renowned doctors. Book your consultation slot today and receive comprehensive health guidance.',
  },
];

const PRESET_INTERESTS = [
  '🏠 Real Estate & Property Buyers',
  '💼 Business Owners & SMBs',
  '🎓 Higher Education & Courses',
  '💻 Software & Tech Professionals',
  '🚗 Automobile & Luxury Cars',
  '🩺 Healthcare & Medical',
  '🛍️ Online Shopping & Fashion',
  '✈️ Travel & Luxury Holidays',
];

export default function CreateMetaCampaignPage() {
  const router = useRouter();

  // Step state: 1, 2, or 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  // Interests array
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    '🏠 Real Estate & Property Buyers',
  ]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Campaign Identity & Accounts
    name: 'Real Estate Leads Kolkata',
    objective: 'OUTCOME_LEADS' as const,
    page_id: '',
    page_name: '',
    page_picture: '',
    ad_account_id: '',
    ad_account_name: '',
    ad_account_balance: 0,
    ad_account_currency: 'INR',

    // Step 2: Budget & Audience
    daily_budget: 500,
    target_age_min: 22,
    target_age_max: 55,
    target_gender: 'ALL',

    // Step 3: Creative & Media
    media_type: 'IMAGE' as 'IMAGE' | 'VIDEO',
    media_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
    media_file_name: '',
    headline: 'Book Luxury 3BHK Flat in Kolkata @ ₹45L',
    primary_text: 'Discover premium lifestyle residences with modern amenities, round-the-clock security, and prime connectivity. Book a private site visit today!',
    call_to_action: 'APPLY_NOW',
    lead_form_id: 'standard_3_question',
    lead_form_name: 'Instant 3-Question Lead Form (Name, Phone, Email)',
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

  // Handle Location addition
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

  // Handle Interest toggle
  const handleToggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  // Handle File Upload for Image / Video
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

  // Apply template
  const handleApplyTemplate = (tmpl: typeof SAMPLE_TEMPLATES[0]) => {
    setFormData((prev) => ({
      ...prev,
      media_url: tmpl.media_url,
      media_type: tmpl.media_type as any,
      headline: tmpl.headline,
      primary_text: tmpl.caption,
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
        lead_form_id: formData.lead_form_id,
        lead_form_name: formData.lead_form_name,
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
      case 'WHATSAPP_MESSAGE': return 'Chat on WhatsApp';
      default: return 'Apply Now';
    }
  };

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
            Launch targeted Facebook & Instagram ads with photos/videos, multi-city targeting, and instant CRM lead sync.
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

      {/* Main Grid: Wizard Form on Left (7 cols), Live Ad Preview on Right (5 cols) */}
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
                  placeholder="e.g. Kolkata Residential Apartments Q4"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                />
              </div>

              {/* Goal Objective */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Campaign Objective</label>
                <div className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#111111]">Generate High-Intent Leads</div>
                      <div className="text-[11px] text-[#666666]">Optimized for Instant Lead Forms on Facebook & Instagram</div>
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
                        📄 {p.name} (ID: {p.id})
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
                        🏢 {a.name} ({a.id}) - {a.currency}
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
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-[#111111]">2. Target Audience & Daily Budget</h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Set daily budget, multi-city target locations, demographics, and interest categories.
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
                  <span className="text-[10px] text-[#666666]">Add multiple cities or states</span>
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

              {/* Detailed Targeting / Interests */}
              <div className="space-y-1.5 pt-2 border-t border-[#E5E5E5]">
                <label className="text-xs font-semibold text-[#111111] flex items-center">
                  <Target className="w-3.5 h-3.5 mr-1" />
                  Detailed Audience Interests
                </label>
                <p className="text-[11px] text-[#666666]">
                  Select the customer profiles you wish to target on Meta algorithms:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition flex items-center ${
                        selectedInterests.includes(interest)
                          ? 'border-[#111111] bg-[#111111] text-white shadow-xs'
                          : 'border-[#E5E5E5] bg-white text-[#666666] hover:border-[#111111] hover:text-[#111111]'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CREATIVE & INSTANT LEAD FORM */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-[#111111]">3. Ad Creative & Instant Lead Form</h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Upload an image or video, write your copy, choose a CTA button, and select the lead capture form.
                </p>
              </div>

              {/* Industry Quick Templates */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Or Pick a 1-Click Industry Creative Template:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="p-2 rounded-lg border border-[#E5E5E5] hover:border-[#111111] bg-[#FAFAFA] hover:bg-white text-left transition group"
                    >
                      <div className="text-[11px] font-semibold text-[#111111] group-hover:underline truncate">
                        {tmpl.label}
                      </div>
                      <div className="text-[10px] text-[#666666] truncate mt-0.5">
                        High Converting
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Type Toggle: Image vs Video */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">Ad Media Format</label>
                  <span className="text-[11px] text-[#666666]">
                    Supported: JPG, PNG, MP4, WebM
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

                {/* Upload or Direct URL */}
                <div className="p-3.5 rounded-lg border border-dashed border-[#D4D4D4] bg-[#FAFAFA] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5 text-xs text-[#666666]">
                    <Upload className="w-4 h-4 text-[#111111]" />
                    <span>
                      {formData.media_file_name 
                        ? `Selected: ${formData.media_file_name}` 
                        : `Upload ${formData.media_type === 'VIDEO' ? 'video (.mp4)' : 'image (.jpg, .png)'} from computer`}
                    </span>
                  </div>
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-semibold hover:bg-[#262626] transition shadow-xs">
                    Choose Local File
                    <input
                      type="file"
                      accept={formData.media_type === 'VIDEO' ? 'video/mp4,video/webm' : 'image/*'}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Or paste online media URL */}
                <div className="space-y-1">
                  <div className="text-[11px] text-[#666666]">Or Paste Direct Web URL:</div>
                  <input
                    type="text"
                    value={formData.media_url}
                    onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                    placeholder="https://example.com/ad-creative.jpg"
                    className="w-full px-3.5 py-1.5 text-xs font-mono rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                  />
                </div>
              </div>

              {/* Primary Text / Ad Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Primary Text (Ad Caption)</label>
                <textarea
                  rows={3}
                  value={formData.primary_text}
                  onChange={(e) => setFormData({ ...formData, primary_text: e.target.value })}
                  placeholder="Tell prospects about your offering, discounts, and unique value proposition..."
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
                  placeholder="e.g. Schedule a Site Visit | Limited Units Left"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                />
              </div>

              {/* Call To Action Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Call To Action (CTA) Button</label>
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

              {/* Instant Lead Form Selection */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">Instant Lead Form</label>
                  <span className="text-[11px] text-[#666666]">
                    {leadForms.length} Existing Forms on Page
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#111111] flex items-center">
                      <UserCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                      Standard 3-Question Instant Lead Form
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Automatically collects prospective customer&apos;s verified Facebook profile details directly into Zyvo CRM:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#111111] font-medium">
                    <div className="p-2 rounded bg-white border border-[#E5E5E5] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Full Name</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-[#E5E5E5] flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Phone Number</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-[#E5E5E5] flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Email Address</span>
                    </div>
                  </div>
                </div>
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
                    🚀 Launch & Publish Campaign
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Live Interactive Mobile Ad Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666] flex items-center">
              <Eye className="w-3.5 h-3.5 mr-1.5 text-[#111111]" />
              Live Feed Ad Preview
            </span>
            <span className="text-[10px] font-mono text-[#999999]">
              Facebook & Instagram Feed
            </span>
          </div>

          {/* Mock Mobile Feed Card */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
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
                    <span>•</span>
                    <span>🌐</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-[#999999]">•••</span>
            </div>

            {/* Ad Caption */}
            <div className="p-3.5 text-xs text-[#111111] leading-relaxed">
              {formData.primary_text || 'Your primary ad copy will appear here...'}
            </div>

            {/* Real Image or Video Ad Banner Preview */}
            <div className="aspect-video bg-zinc-900 border-y border-[#E5E5E5] relative overflow-hidden flex items-center justify-center">
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
                <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                  <Building2 className="w-10 h-10 mb-2 opacity-50" />
                  <div className="text-xs font-bold text-zinc-200">
                    {formData.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Instant Lead Generation Ad
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
                className={`shrink-0 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs flex items-center space-x-1.5 ${
                  formData.call_to_action === 'WHATSAPP_MESSAGE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-[#111111] hover:bg-[#262626]'
                }`}
              >
                {formData.call_to_action === 'WHATSAPP_MESSAGE' && (
                  <MessageCircle className="w-3.5 h-3.5" />
                )}
                <span>{getCtaLabel(formData.call_to_action)}</span>
              </button>
            </div>
          </div>

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
              <span>Age & Gender:</span>
              <span className="font-mono text-[#111111]">{formData.target_age_min} - {formData.target_age_max} Yrs ({formData.target_gender})</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Format:</span>
              <span className="font-medium text-[#111111]">
                {formData.media_type === 'VIDEO' ? '🎥 Video Ad' : '🖼️ Image Ad'}
              </span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Button (CTA):</span>
              <span className="font-semibold text-[#111111]">{getCtaLabel(formData.call_to_action)}</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Lead Sync:</span>
              <span className="text-emerald-700 font-semibold">Instant to Zyvo CRM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

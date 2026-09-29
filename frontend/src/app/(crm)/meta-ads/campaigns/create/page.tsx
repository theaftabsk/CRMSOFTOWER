'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ChevronRight, CheckCircle2, AlertCircle, 
  Layers, Wallet, MapPin, Users, Sparkles, Send, 
  Eye, HelpCircle, Building2, Facebook, Phone, Mail, UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

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
    target_location: 'Kolkata, West Bengal',
    target_age_min: 22,
    target_age_max: 55,
    target_gender: 'ALL',

    // Step 3: Creative & Lead Form
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
  const calculateEstimatedLeads = (budget: number) => {
    const minLeads = Math.max(2, Math.floor(budget / 35));
    const maxLeads = Math.max(5, Math.floor(budget / 18));
    return `${minLeads} - ${maxLeads}`;
  };

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
        target_location: formData.target_location,
        target_age_min: formData.target_age_min,
        target_age_max: formData.target_age_max,
        target_gender: formData.target_gender,
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
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
            Launch Facebook & Instagram Lead Ads with 1-click forms directly into Zyvo CRM.
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

      {/* Main Grid: Wizard Form on Left, Live Ad Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Body (7 cols) */}
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
                      <div className="text-[11px] text-[#666666]">Optimized for Instant Forms on Facebook & Instagram</div>
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
                  Set how much you wish to spend each day and specify the geographic reach and demographics.
                </p>
              </div>

              {/* Daily Budget Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111]">Daily Budget (INR)</label>
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Est. {calculateEstimatedLeads(formData.daily_budget)} Leads / day
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[300, 500, 1000, 2000].map((amt) => (
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
                    step="50"
                    value={formData.daily_budget}
                    onChange={(e) => setFormData({ ...formData, daily_budget: Number(e.target.value) || 100 })}
                    className="w-full px-3.5 py-2 text-xs font-mono font-semibold rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                    placeholder="Or enter custom daily budget"
                  />
                </div>
              </div>

              {/* Target Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  Target Location (City / State / Country)
                </label>
                <input
                  type="text"
                  value={formData.target_location}
                  onChange={(e) => setFormData({ ...formData, target_location: e.target.value })}
                  placeholder="e.g. Kolkata, West Bengal or All India"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                />
                {/* Location Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Kolkata, West Bengal', 'West Bengal', 'Delhi NCR', 'Mumbai, Maharashtra', 'All India'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setFormData({ ...formData, target_location: loc })}
                      className="text-[10px] px-2 py-0.5 rounded border border-[#E5E5E5] bg-[#F8F8F8] text-[#666666] hover:text-[#111111] hover:border-[#111111] transition"
                    >
                      + {loc}
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
            </div>
          )}

          {/* STEP 3: CREATIVE & INSTANT LEAD FORM */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-bold text-[#111111]">3. Ad Creative & Instant Lead Form</h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  Compose the ad caption, headline, call-to-action button, and configure the lead capture form.
                </p>
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

              {/* Call To Action */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111]">Call To Action Button</label>
                <select
                  value={formData.call_to_action}
                  onChange={(e) => setFormData({ ...formData, call_to_action: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#D4D4D4] focus:outline-none focus:border-[#111111] bg-white transition"
                >
                  <option value="APPLY_NOW">Apply Now</option>
                  <option value="LEARN_MORE">Learn More</option>
                  <option value="GET_QUOTE">Get Quote</option>
                  <option value="SIGN_UP">Sign Up</option>
                  <option value="CONTACT_US">Contact Us</option>
                </select>
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
                      Standard 3-Question Lead Form
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666]">
                    Automatically collects prospective buyer&apos;s verified Facebook profile details:
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

            {/* Ad Banner Preview */}
            <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 border-y border-[#E5E5E5] flex flex-col items-center justify-center p-6 text-center">
              <Building2 className="w-10 h-10 text-[#666666] mb-2" />
              <div className="text-xs font-bold text-[#111111]">
                {formData.name}
              </div>
              <div className="text-[11px] text-[#666666] mt-0.5">
                Instant Lead Generation Campaign
              </div>
            </div>

            {/* Ad Action Footer */}
            <div className="p-3.5 bg-[#FAFAFA] flex items-center justify-between">
              <div className="truncate pr-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                  {formData.target_location}
                </div>
                <div className="text-xs font-bold text-[#111111] truncate mt-0.5">
                  {formData.headline || 'Headline goes here'}
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#111111] text-white text-xs font-semibold shadow-xs"
              >
                {formData.call_to_action.replace('_', ' ')}
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
              <span>Target Geo:</span>
              <span className="font-medium text-[#111111] truncate max-w-[160px]">{formData.target_location}</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Target Age:</span>
              <span className="font-mono text-[#111111]">{formData.target_age_min} - {formData.target_age_max} Yrs</span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Lead Capture:</span>
              <span className="text-emerald-700 font-medium">Instant Ingestion to CRM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Building2, Compass, GraduationCap, UtensilsCrossed, 
  ShoppingBag, Stethoscope, Laptop, Briefcase, Check, 
  ChevronRight, Layers, ArrowUpRight, Search, Plus
} from 'lucide-react';
import { formatNumber } from '../../lib/utils';

interface IndustryVertical {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  dealTerminology: string;
  dealTerminologyPlural: string;
  pipelineStages: { name: string; probability: number }[];
  customFields: string[];
  activeTenants: number;
}

const verticals: IndustryVertical[] = [
  {
    id: 'real_estate',
    name: 'Real Estate & Property',
    badge: 'High Ticket',
    tagline: 'Brokers, builders, property developers & rental agencies',
    dealTerminology: 'Property Unit',
    dealTerminologyPlural: 'Properties & Units',
    pipelineStages: [
      { name: 'Inquiry Received', probability: 20 },
      { name: 'Site Visit Scheduled', probability: 40 },
      { name: 'Visit Completed', probability: 60 },
      { name: 'Price Negotiation', probability: 80 },
      { name: 'Booking Advance Received', probability: 100 },
    ],
    customFields: ['Unit No / Floor', 'Carpet Area (sq ft)', 'Possession Date', 'Parking Allotted'],
    activeTenants: 7,
  },
  {
    id: 'travel_tours',
    name: 'Travel & Tour Packages',
    badge: 'Hospitality',
    tagline: 'Tour operators, holiday planners & corporate travel desks',
    dealTerminology: 'Tour Booking',
    dealTerminologyPlural: 'Tour Bookings',
    pipelineStages: [
      { name: 'Trip Inquiry', probability: 20 },
      { name: 'Itinerary Sent', probability: 40 },
      { name: 'Visa & Flight Confirmed', probability: 70 },
      { name: 'Advance Received', probability: 90 },
      { name: 'Voucher Dispatched', probability: 100 },
    ],
    customFields: ['Destination', 'No. of Travelers', 'Travel Dates', 'Passport Number'],
    activeTenants: 2,
  },
  {
    id: 'edtech_schools',
    name: 'School / College & EdTech',
    badge: 'Education',
    tagline: 'Universities, coaching academies, bootcamps & online platforms',
    dealTerminology: 'Student Admission',
    dealTerminologyPlural: 'Admissions & Inquiries',
    pipelineStages: [
      { name: 'Prospect Inquiry', probability: 20 },
      { name: 'Counseling Call', probability: 40 },
      { name: 'Demo Lecture Attended', probability: 65 },
      { name: 'Application Submitted', probability: 85 },
      { name: 'Enrolled & Fees Paid', probability: 100 },
    ],
    customFields: ['Selected Course / Stream', 'Academic Year', 'Previous Marks %', 'Parent Contact'],
    activeTenants: 3,
  },
  {
    id: 'restaurant_catering',
    name: 'Restaurant & Catering',
    badge: 'F&B Events',
    tagline: 'Banquets, event caterers, fine dine & bulk meal suppliers',
    dealTerminology: 'Banquet & Event',
    dealTerminologyPlural: 'Events & Banquets',
    pipelineStages: [
      { name: 'Event Inquiry', probability: 25 },
      { name: 'Menu Tasting', probability: 50 },
      { name: 'Quote Finalized', probability: 75 },
      { name: 'Advance Paid', probability: 95 },
      { name: 'Event Executed', probability: 100 },
    ],
    customFields: ['Event Date', 'Guest Count (Pax)', 'Food Preference', 'Venue Name'],
    activeTenants: 2,
  },
  {
    id: 'retail_wholesale',
    name: 'Retail & Wholesale',
    badge: 'Commerce',
    tagline: 'Wholesalers, distributors, suppliers & B2B merchandise',
    dealTerminology: 'Purchase Order',
    dealTerminologyPlural: 'Orders & Shipments',
    pipelineStages: [
      { name: 'RFQ Received', probability: 20 },
      { name: 'Catalog & Sample Dispatched', probability: 45 },
      { name: 'Commercial Quote Approved', probability: 70 },
      { name: 'Dispatch & Invoicing', probability: 90 },
      { name: 'Delivered & Settled', probability: 100 },
    ],
    customFields: ['SKU Count', 'Minimum Order Quantity', 'Credit Terms (Days)', 'GSTIN'],
    activeTenants: 2,
  },
  {
    id: 'healthcare_clinics',
    name: 'Healthcare & Diagnostic Clinics',
    badge: 'Clinical',
    tagline: 'Clinics, dental centers, diagnostic labs & wellness spas',
    dealTerminology: 'Treatment Package',
    dealTerminologyPlural: 'Treatments & Packages',
    pipelineStages: [
      { name: 'Consultation Booked', probability: 30 },
      { name: 'Diagnosis & Estimate', probability: 55 },
      { name: 'Treatment Scheduled', probability: 80 },
      { name: 'In Treatment', probability: 95 },
      { name: 'Discharged / Completed', probability: 100 },
    ],
    customFields: ['Attending Doctor', 'Medical Insurance ID', 'Diagnosis Notes', 'Next Checkup Date'],
    activeTenants: 4,
  },
  {
    id: 'saas_it',
    name: 'Software / SaaS & IT Services',
    badge: 'Tech Core',
    tagline: 'Tech startups, software agencies & cloud solutions',
    dealTerminology: 'Deal Contract',
    dealTerminologyPlural: 'Deals & Pipeline',
    pipelineStages: [
      { name: 'New Inbound Lead', probability: 20 },
      { name: 'Discovery & Demo', probability: 40 },
      { name: 'Proposal Sent', probability: 60 },
      { name: 'Security & Negotiation', probability: 80 },
      { name: 'Won / Signed', probability: 100 },
    ],
    customFields: ['Contract Duration (Months)', 'Billing Frequency', 'Cloud Tech Stack', 'Key Decision Maker'],
    activeTenants: 10,
  },
  {
    id: 'consulting_agency',
    name: 'Consulting & Professional Services',
    badge: 'Advisory',
    tagline: 'Legal firms, CA practices, marketing agencies & corporate advisory',
    dealTerminology: 'Retainer Mandate',
    dealTerminologyPlural: 'Mandates & Projects',
    pipelineStages: [
      { name: 'Brief Received', probability: 20 },
      { name: 'Scope & Discovery', probability: 45 },
      { name: 'Retainer Proposed', probability: 65 },
      { name: 'Agreement Signed', probability: 90 },
      { name: 'Kickoff & Retainer Live', probability: 100 },
    ],
    customFields: ['Practice Area', 'Engagement Model', 'Hourly Billing Rate', 'Project Milestone Count'],
    activeTenants: 2,
  },
];

export default function IndustryVerticalsPage() {
  const [selectedVertical, setSelectedVertical] = useState<IndustryVertical>(verticals[6]);
  const [search, setSearch] = useState('');

  const filtered = verticals.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.tagline.toLowerCase().includes(search.toLowerCase()) ||
    v.dealTerminology.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
              Industry Vertical Architectures
            </h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#111111] text-white font-mono">
              8 Dynamic Templates
            </span>
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Standardized terminology, pipeline lifecycles, and custom schema fields provisioned automatically on signup.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="bg-white border border-[#E5E5E5] focus:border-[#111111] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition w-56"
          />
        </div>
      </div>

      {/* Main Grid: Left Vertical Selector & Right Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Vertical List */}
        <div className="lg:col-span-5 space-y-2.5">
          {filtered.map((vert) => {
            const isSelected = selectedVertical.id === vert.id;

            return (
              <div
                key={vert.id}
                onClick={() => setSelectedVertical(vert)}
                className={`card-minimal p-4 cursor-pointer transition-all duration-150 flex items-center justify-between ${
                  isSelected
                    ? 'border-[#111111] ring-1 ring-[#111111] bg-white shadow-sm'
                    : 'hover:bg-white hover:border-[#D4D4D4]'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-[#111111]">{vert.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F4F4F6] text-[#666666] font-mono border border-[#E5E5E5]">
                      {vert.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#666666] mt-1 line-clamp-1">
                    {vert.tagline}
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <div className="text-[11px] font-mono font-bold text-[#111111]">
                    {vert.activeTenants}
                  </div>
                  <div className="text-[9px] text-[#888888]">tenants</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Vertical Detail Viewer */}
        <div className="lg:col-span-7">
          <div className="card-minimal p-6 space-y-6 bg-white sticky top-24">
            {/* Header */}
            <div className="border-b border-[#E5E5E5] pb-4 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-[#111111]">{selectedVertical.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#111111] text-white font-mono">
                    {selectedVertical.badge}
                  </span>
                </div>
                <p className="text-xs text-[#666666] mt-1">{selectedVertical.tagline}</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-semibold text-[#16A34A] bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  {selectedVertical.activeTenants} Active Tenants
                </span>
              </div>
            </div>

            {/* Terminology Mapping */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Dynamic Vocabulary Mapping
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl">
                  <div className="text-[11px] text-[#888888]">Singular Entity Term</div>
                  <div className="font-bold text-sm text-[#111111] mt-0.5">{selectedVertical.dealTerminology}</div>
                </div>
                <div className="p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl">
                  <div className="text-[11px] text-[#888888]">Sidebar & Plural Term</div>
                  <div className="font-bold text-sm text-[#111111] mt-0.5">{selectedVertical.dealTerminologyPlural}</div>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Architecture */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Pre-configured Sales Stages & Win Probability
              </h3>
              <div className="space-y-2">
                {selectedVertical.pipelineStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-[#111111]">{stage.name}</span>
                    </div>
                    <span className="font-mono font-bold text-[#16A34A] bg-green-50 px-2 py-0.5 rounded border border-green-200 text-[11px]">
                      {stage.probability}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Injected Custom Schema Fields */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Auto-Provisioned Custom Fields
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedVertical.customFields.map((field, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#F4F4F6] border border-[#E5E5E5] text-xs font-mono text-[#111111]"
                  >
                    <Check className="w-3 h-3 text-[#16A34A] mr-1.5" />
                    <span>{field}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

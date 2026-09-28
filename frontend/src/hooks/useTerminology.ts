import { useState, useEffect } from 'react';
import { getIndustryTemplate, IndustryVerticalConfig } from '../config/industryTemplates';
import { api } from '../lib/api';

export interface Terminology {
  industryId: string;
  industryName: string;
  dealSingular: string;     // e.g. "Property Booking", "Student Admission", "Trip Package"
  dealPlural: string;       // e.g. "Property Bookings", "Student Admissions", "Trip Packages"
  leadSingular: string;     // e.g. "Property Inquiry", "Admission Enquiry", "Travel Enquiry"
  leadPlural: string;       // e.g. "Inquiries", "Enquiries"
  config: IndustryVerticalConfig;
}

export function useTerminology(overrideIndustryId?: string): Terminology {
  const [industryKey, setIndustryKey] = useState<string>(overrideIndustryId || 'saas_it');

  useEffect(() => {
    if (overrideIndustryId) {
      setIndustryKey(overrideIndustryId);
      return;
    }

    // 1. Instant optimistic load from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('crm_selected_industry');
      if (stored) {
        setIndustryKey(stored);
      }
    }

    // 2. Authoritative live sync with PostgreSQL database
    async function syncFromDatabase() {
      try {
        const res = await api.getCurrentIndustry();
        const dbIndustryId = res?.config?.industry_id || res?.data?.config?.industry_id;
        if (dbIndustryId) {
          setIndustryKey(dbIndustryId);
          if (typeof window !== 'undefined') {
            localStorage.setItem('crm_selected_industry', dbIndustryId);
          }
        }
      } catch (err) {
        // Silently retain cached local state if offline
      }
    }

    syncFromDatabase();
  }, [overrideIndustryId]);

  const config = getIndustryTemplate(industryKey);

  return {
    industryId: config.id,
    industryName: config.name,
    dealSingular: config.dealTerminology,
    dealPlural: config.dealsTerminology,
    leadSingular: config.leadTerminology,
    leadPlural: `${config.leadTerminology}s`,
    config,
  };
}

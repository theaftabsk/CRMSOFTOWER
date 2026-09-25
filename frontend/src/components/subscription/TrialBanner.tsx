'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

interface TrialBannerProps {
  remainingDays: number;
  isExpired: boolean;
  status: string;
  onRefresh?: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  remainingDays,
  isExpired,
  status,
  onRefresh,
}) => {
  // Only display for free trial accounts (TRIALING or EXPIRED)
  // Subscribed/Paid accounts (ACTIVE) or others do not see the trial banner
  if (status === 'ACTIVE' || (status !== 'TRIALING' && !isExpired)) return null;

  const isWarning = remainingDays <= 3 && !isExpired;

  if (isExpired) {
    return (
      <div className="bg-[#111111] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#262626] shadow-sm animate-fadeIn">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-semibold text-red-400">14-Day Free Trial Expired:</span>
          <span className="text-[#CCCCCC]">
            Workspace is currently locked. Subscribe via Cashfree Payments to resume full CRM operations.
          </span>
        </div>
        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          <Link
            href="/billing"
            className="px-3 py-1 bg-white text-[#111111] font-semibold rounded-md hover:bg-[#F0F0F0] transition flex items-center space-x-1"
          >
            <span>Unlock Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b transition-all ${
        isWarning
          ? 'bg-amber-500/10 text-amber-900 border-amber-500/20'
          : 'bg-[#FAFAFA] text-[#333333] border-[#E5E5E5]'
      }`}
    >
      <div className="flex items-center space-x-2">
        {isWarning ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
        )}
        <span className="font-semibold text-[#111111]">
          14-Day Free Trial Active:
        </span>
        <span>
          {remainingDays} day{remainingDays === 1 ? '' : 's'} remaining — All features 100% unlocked.
        </span>
      </div>

      <div className="flex items-center space-x-3 mt-1 sm:mt-0">
        <Link
          href="/billing"
          className="px-2.5 py-1 bg-[#111111] text-white text-[11px] font-medium rounded-md hover:bg-[#262626] transition flex items-center space-x-1 shadow-xs"
        >
          <span>Upgrade with Cashfree</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

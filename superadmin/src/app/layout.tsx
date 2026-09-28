import type { Metadata } from 'next';
import './globals.css';
import { SuperAdminSidebar } from '../components/SuperAdminSidebar';
import { Search, ShieldAlert, Bell, ExternalLink, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Zyvo SuperAdmin — Master Platform Command Center',
  description: 'Multi-tenant cloud management, organization governance, and vertical provisioning',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F8F8] text-[#111111] antialiased flex" suppressHydrationWarning>
        {/* SuperAdmin Master Navigation */}
        <SuperAdminSidebar />

        {/* Master Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Command Navbar */}
          <header className="h-15 border-b border-[#E5E5E5] bg-white px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center space-x-4 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tenants, domains, users, or DB IDs... (Ctrl + K)"
                  className="w-full bg-[#FAFAFA] border border-[#E5E5E5] focus:border-[#111111] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#999999] outline-none transition"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Telemetry Status Indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] text-emerald-700 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cluster Healthy (8 Nodes)</span>
              </div>

              {/* Tenant Portal Link */}
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center space-x-1.5 text-xs text-[#666666] hover:text-[#111111] px-2.5 py-1.5 rounded-lg border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] transition"
              >
                <span>CRM Workspace</span>
                <ExternalLink className="w-3 h-3 text-[#888888]" />
              </a>

              {/* Notification Badge */}
              <button
                type="button"
                className="w-8 h-8 rounded-lg border border-[#E5E5E5] flex items-center justify-center text-[#666666] hover:text-[#111111] hover:bg-[#FAFAFA] transition relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
              </button>
            </div>
          </header>

          {/* Page Body Viewport */}
          <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#F8F8F8] text-[#111111] min-h-screen font-sans antialiased">{children}</div>;
}

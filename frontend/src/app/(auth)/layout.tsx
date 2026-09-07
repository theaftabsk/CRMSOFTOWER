import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-slate-950 min-h-screen">{children}</div>;
}

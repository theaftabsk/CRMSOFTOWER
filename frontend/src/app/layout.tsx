import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../providers/AppProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kaspro | Enterprise Cloud CRM & Revenue OS",
  description: "Kaspro Enterprise Multi-Tenant Cloud CRM Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#111111] font-sans antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

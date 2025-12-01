import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ERPNext CRM Lead Parser - BytesWrite",
  description: "Streamlined lead data parser for ERPNext CRM system. Powered by BytesWrite - Validate, clean, and import lead data with intelligent parsing capabilities.",
  keywords: "ERPNext, CRM, lead parser, data validation, BytesWrite, ERP solutions",
  authors: [{ name: "BytesWrite Team", url: "https://byteswrite.com" }],
  openGraph: {
    title: "ERPNext CRM Lead Parser - BytesWrite",
    description: "Streamlined lead data parser for ERPNext CRM system",
    url: "https://byteswrite.com",
    siteName: "BytesWrite ERP Solutions",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: 'https://res.cloudinary.com/bw-cdn/image/upload/v1753892513/byteswriteLogoLightShort.svg' },
    ],
    apple: 'https://res.cloudinary.com/bw-cdn/image/upload/v1753892513/byteswriteLogoLightShort.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          {/* Simple Footer */}
          <footer className="bg-white border-t border-gray-200 py-6">
            <div className="mx-auto max-w-[1800px] px-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div className="text-sm text-gray-600">
                  © 2025 BytesWrite Solutions. ERP Parser for MT.
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <a
                    href="https://byteswrite.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    BytesWrite.com
                  </a>
                  <span className="text-gray-300">|</span>
                  <a
                    href="mailto:contact@byteswrite.com"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Support
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

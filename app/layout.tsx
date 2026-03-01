import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "42 Agency AEO/GEO Intel Report | AI Visibility Analysis",
  description: "AI Engine Optimization report for 42 Agency - analyzing visibility across ChatGPT, Perplexity, and Gemini for B2B SaaS marketing, demand generation, and HubSpot partner queries. AEO Score: 0/10 - Critical gap identified.",
  openGraph: {
    title: "42 Agency AEO/GEO Intel Report | AI Visibility Analysis",
    description: "Critical gap identified: 42 Agency receives ZERO mentions across all AI engines for key service queries. AEO Score: 0/10.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

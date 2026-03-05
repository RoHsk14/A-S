import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AppShellNavigation } from "@/components/layout/AppShellNavigation";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Afro Spy | Winning Ads Tracker",
  description: "Trouver produits gagnants Afrique en quelques clics. Le meilleur Spy tool Shopify Youcan.",
  keywords: ["Trouver produits gagnants Afrique", "Spy tool Shopify Youcan", "ad spy", "pub intelligence", "dropshipping", "afro spy"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} bg-slate-50 text-text-primary antialiased`}>
        <ToastProvider />
        <AppShellNavigation isAuthenticated={isAuthenticated}>
          {children}
        </AppShellNavigation>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AfroSpyLogo } from "@/components/ui/AfroSpyLogo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Afro Spy | Winning Ads Tracker",
  description: "Trouvez les produits gagnants en Afrique en quelques clics.",
  keywords: ["ad spy", "pub intelligence", "dropshipping", "winning products", "afro spy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} bg-slate-50 text-text-primary antialiased`}>
        <ToastProvider />
        {/* Main Layout Wrapper */}
        <div className="flex min-h-screen bg-slate-50 pb-[64px] md:pb-0">

          {/* Desktop Sidebar */}
          <div className="hidden md:flex sticky top-0 h-screen">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 w-full overflow-x-hidden flex flex-col min-h-screen">

            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <AfroSpyLogo className="w-8 h-8 shadow-sm" />
                <h1 className="text-lg font-black tracking-tight text-slate-900">
                  AFRO <span className="text-orange-600">SPY</span>
                </h1>
              </div>
            </header>

            {/* Page Content */}
            <div className="flex-1">{children}</div>

            {/* Mobile Bottom Tab Bar */}
            <MobileTabBar />
          </main>
        </div>
      </body>
    </html>
  );
}

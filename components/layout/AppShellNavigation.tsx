"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { AfroSpyLogo } from "@/components/ui/AfroSpyLogo";

export function AppShellNavigation({ children, isAuthenticated }: { children: React.ReactNode, isAuthenticated: boolean }) {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isLandingPage = pathname === "/" && !isAuthenticated;

    if (isAuthPage || isLandingPage) {
        return <div className="min-h-screen w-full">{children}</div>;
    }

    return (
        <div className="flex min-h-screen bg-slate-50 pb-[64px] lg:pb-0">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex sticky top-0 h-screen">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full overflow-x-hidden relative flex flex-col min-h-screen max-w-full">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <AfroSpyLogo className="w-8 h-8 shadow-sm" />
                        <h1 className="text-lg font-black tracking-tight text-slate-900">
                            AFRO <span className="text-orange-600">SPY</span>
                        </h1>
                    </div>

                    {/* Mobile Credits Badge */}
                    <div className="flex items-center gap-1.5 bg-orange-50 px-2.5 py-1.5 rounded-full border border-orange-100">
                        <span className="text-[10px] font-bold text-orange-900">⚡ 3/10</span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</div>

                {/* Mobile Bottom Tab Bar */}
                <MobileTabBar />
            </main>
        </div>
    );
}

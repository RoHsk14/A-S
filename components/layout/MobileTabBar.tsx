"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, Search, Folder, Store, Settings } from "lucide-react";

const MOBILE_NAV = [
    { href: "/", label: "Winners", icon: Target },
    { href: "/top-stores", label: "Top Stores", icon: Store },
    { href: "/scraper", label: "Search", icon: Search },
    { href: "/spy-list", label: "Spy-List", icon: Folder },
    { href: "/my-stores", label: "My Stores", icon: Store },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileTabBar() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-[150] shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
            {MOBILE_NAV.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col flex-1 items-center justify-center h-12 gap-1 rounded-xl transition-colors"
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-orange-100 text-orange-600" : "text-slate-500 hover:bg-slate-50"
                            }`}>
                            <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[9px] font-semibold tracking-wide w-full truncate text-center px-0.5 ${isActive ? "text-orange-600" : "text-slate-500"
                            }`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}

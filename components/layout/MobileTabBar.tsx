"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Target, Flame, Folder, Bot } from "lucide-react";

const MOBILE_NAV = [
    { href: "/", label: "Winners", icon: Target },
    { href: "/trending", label: "Trending", icon: Flame },
    { href: "/spy-list", label: "Spy List", icon: Folder },
    { href: "/scraper", label: "Scraper", icon: Bot },
];

export function MobileTabBar() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 pb-safe">
            {MOBILE_NAV.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex flex-col items-center justify-center w-16 h-12 gap-1 rounded-xl transition-colors"
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-orange-100 text-orange-600" : "text-slate-500 hover:bg-slate-50"
                            }`}>
                            <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[9px] font-semibold tracking-wide ${isActive ? "text-orange-600" : "text-slate-500"
                            }`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}

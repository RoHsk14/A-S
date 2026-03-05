"use client";

import { Store } from "lucide-react";

export function StoreLogo({ domain }: { domain: string }) {
    return (
        <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
            <img
                src={`https://logo.clearbit.com/${domain}`}
                alt={domain}
                className="w-full h-full object-cover relative z-10"
                onError={(e) => {
                    e.currentTarget.style.display = "none";
                }}
            />
            {/* Fallback Icon behind the image, visible if the image fails or loads slowly */}
            <Store className="w-5 h-5 text-slate-300 absolute z-0" />
        </div>
    );
}

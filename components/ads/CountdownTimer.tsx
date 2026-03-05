"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function CountdownTimer({ text }: { text: string }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const nextSunday = new Date();
            // Find next Sunday 23:59:59
            nextSunday.setDate(now.getDate() + (7 - now.getDay()));
            nextSunday.setHours(23, 59, 59, 999);

            const diff = nextSunday.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("Mise à jour en cours...");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);

            let timeStr = "";
            if (days > 0) timeStr += `${days}j `;
            timeStr += `${hours}h ${minutes}m`;
            setTimeLeft(timeStr);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2.5 bg-[#0F172A] border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl shadow-lg w-fit mt-4">
            <Clock className="w-4 h-4 text-orange-500 animate-pulse flex-shrink-0" />
            <span className="text-sm font-medium">
                <span className="text-white font-bold">{text} dénichées.</span> Prochaine mise à jour dans <span className="text-orange-400 font-bold tracking-widest bg-slate-800/80 px-2.5 py-1 rounded-md ml-1">{timeLeft}</span>
            </span>
        </div>
    );
}

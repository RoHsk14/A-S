"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);

    const onDismiss = () => {
        router.back();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onDismiss();
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onDismiss();
        }
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6"
        >
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-6xl h-full max-h-[92vh] bg-slate-50 rounded-[28px] shadow-2xl overflow-hidden flex flex-col border border-slate-200/50"
            >
                {/* Close Button */}
                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 z-50 p-2.5 bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full backdrop-blur-md transition-colors border border-slate-200/50 shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex-1 overflow-y-auto w-full h-full">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

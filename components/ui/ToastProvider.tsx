"use client";
import { Toaster } from "react-hot-toast";

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#FFFFFF",
                    color: "#334155",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    padding: "12px 16px",
                },
                success: {
                    iconTheme: { primary: "#FF4500", secondary: "#FFFFFF" },
                    style: { borderColor: "rgba(255,69,0,0.3)" },
                },
                error: {
                    iconTheme: { primary: "#F85149", secondary: "#FFFFFF" },
                    style: { borderColor: "rgba(248,81,73,0.3)" },
                },
            }}
        />
    );
}

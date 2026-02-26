import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "orange-burnt": "#FF4500",
                "orange-burnt-dark": "#CC3700",
                "orange-burnt-light": "#FF6A33",
                gold: "#FFD700",
                "gold-light": "#FFE44D",
                obsidian: "#F8FAFC",
                charcoal: "#FFFFFF",
                "charcoal-light": "#F1F5F9",
                "charcoal-border": "#E2E8F0",
                "text-primary": "#1E293B",
                "text-secondary": "#475569",
                "text-muted": "#64748B",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
            },
            backgroundImage: {
                "gradient-orange": "linear-gradient(135deg, #FF4500, #FF6A33)",
                "gradient-gold": "linear-gradient(135deg, #FFD700, #FF8C00)",
                "gradient-dark": "linear-gradient(180deg, #13131A 0%, #0A0A0F 100%)",
                "gradient-card": "linear-gradient(180deg, transparent 40%, rgba(10,10,15,0.95) 100%)",
                "glow-orange": "radial-gradient(ellipse at center, rgba(255,69,0,0.15) 0%, transparent 70%)",
            },
            boxShadow: {
                "orange-glow": "0 0 20px rgba(255, 69, 0, 0.3)",
                "orange-glow-lg": "0 0 40px rgba(255, 69, 0, 0.4)",
                "gold-glow": "0 0 20px rgba(255, 215, 0, 0.2)",
                "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
                "card-hover": "0 8px 40px rgba(0, 0, 0, 0.6)",
            },
            animation: {
                shimmer: "shimmer 2s infinite linear",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
        },
    },
    plugins: [],
};

export default config;

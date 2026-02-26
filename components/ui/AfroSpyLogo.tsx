export function AfroSpyLogo({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Fond arrondi style Minea */}
            <rect width="100" height="100" rx="22" fill="url(#minea-gradient)" />

            {/* Dégradé Orange Brûlé vers Orange Vif */}
            <defs>
                <linearGradient id="minea-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF4500" />
                    <stop offset="1" stopColor="#FF6A00" />
                </linearGradient>
            </defs>

            {/* Texte A-S blanc et gras */}
            <text
                x="50%"
                y="55%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="white"
                fontSize="45"
                fontWeight="900"
                fontFamily="Inter, sans-serif"
            >
                A-S
            </text>
        </svg>
    );
}

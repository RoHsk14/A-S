import { Bell, Shield, Globe, ChevronRight } from "lucide-react";

const SETTINGS_SECTIONS = [
    {
        title: "Préférences",
        icon: Globe,
        color: "text-amber-600",
        bg: "bg-amber-100",
        border: "border-amber-200",
        items: [
            { label: "Langue", value: "Français", type: "select" },
            { label: "Région par défaut", value: "Afrique", type: "select" },
        ],
    },
    {
        title: "Notifications",
        icon: Bell,
        color: "text-green-600",
        bg: "bg-green-100",
        border: "border-green-200",
        items: [
            { label: "Nouveaux winners", value: "Activé", type: "toggle" },
            { label: "Alertes trending", value: "Activé", type: "toggle" },
        ],
    },
    {
        title: "Sécurité",
        icon: Shield,
        color: "text-blue-600",
        bg: "bg-blue-100",
        border: "border-blue-200",
        items: [
            { label: "Accès API", value: "Actif", type: "status" },
            { label: "Plan abonnement", value: "Beta Gratuit", type: "status" },
        ],
    },
];

export default function SettingsPage() {
    return (
        <div className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚙️</span>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
            </div>
            <p className="text-sm text-text-muted ml-9 mb-8">
                Configurez votre plateforme Afro Spy
            </p>

            <div className="space-y-4">
                {SETTINGS_SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div
                            key={section.title}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                        >
                            {/* Section header */}
                            <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50`}>
                                <div className={`w-7 h-7 rounded-lg ${section.bg} border ${section.border} flex items-center justify-center flex-shrink-0`}>
                                    <Icon className={`w-3.5 h-3.5 ${section.color}`} />
                                </div>
                                <h2 className="text-sm font-semibold text-text-primary">{section.title}</h2>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-slate-100">
                                {section.items.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between px-4 py-3 group hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-text-secondary">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${item.value === "Non configuré" ? "text-text-muted" : "text-text-primary"
                                                }`}>
                                                {item.value}
                                            </span>
                                            <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-secondary transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

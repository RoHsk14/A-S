import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AfroSpyLogo } from "@/components/ui/AfroSpyLogo";
import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

const translateAuthError = (message: string) => {
    if (message.includes("rate limit")) return "Vous avez fait trop de tentatives. (Limite dépassée)";
    if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect.";
    if (message.includes("is invalid")) return "L'adresse email est invalide.";
    return "Erreur de connexion : " + message;
};

export default async function LoginPage(props: {
    searchParams: Promise<{ message: string; error: string }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        return redirect("/");
    }

    const signIn = async (formData: FormData) => {
        "use server";
        const email = (formData.get("email") as string).trim();
        const password = formData.get("password") as string;
        const supabase = await createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return redirect(`/login?error=${encodeURIComponent(translateAuthError(error.message))}`);
        return redirect("/");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col items-center mb-8">
                    <AfroSpyLogo className="w-16 h-16 shadow-orange-glow mb-4" />
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight text-center">
                        Bienvenue sur AFRO <span className="text-orange-600">SPY</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        Connectez-vous à votre Laboratory.
                    </p>
                </div>

                <form className="flex-1 flex flex-col w-full gap-4 text-slate-900">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                name="email"
                                placeholder="vous@exemple.com"
                                type="email"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1" htmlFor="password">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {searchParams?.error && (
                        <p className="mt-2 text-sm text-center font-bold text-red-500 bg-red-50 p-2 rounded-lg">
                            {searchParams.error}
                        </p>
                    )}
                    {searchParams?.message && (
                        <p className="mt-2 text-sm text-center font-bold text-green-600 bg-green-50 p-2 rounded-lg">
                            {searchParams.message}
                        </p>
                    )}

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            formAction={signIn}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-95 text-sm"
                        >
                            Se connecter
                        </button>
                    </div>

                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">OU</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <GoogleAuthButton />
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        Pas encore de compte ?{" "}
                        <Link href="/register" className="text-orange-600 font-bold hover:underline">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-8 tracking-widest uppercase">Afro Spy © 2024</p>
        </div>
    );
}

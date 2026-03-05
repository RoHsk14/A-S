import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AfroSpyLogo } from "@/components/ui/AfroSpyLogo";
import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

const translateAuthError = (message: string) => {
    if (message.includes("rate limit")) return "Vous avez fait trop de tentatives. (Limite dépassée)";
    if (message.includes("already registered")) return "Cet email est déjà utilisé.";
    if (message.includes("Password should be")) return "Le mot de passe doit faire au moins 6 caractères.";
    if (message.includes("is invalid")) return "L'adresse email est invalide.";
    return "Erreur d'authentification : " + message;
};

export default async function RegisterPage(props: {
    searchParams: Promise<{ error: string }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        return redirect("/");
    }

    const signUp = async (formData: FormData) => {
        "use server";
        const email = (formData.get("email") as string).trim();
        const password = formData.get("password") as string;
        const supabase = await createClient();

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            },
        });

        if (error) return redirect(`/register?error=${encodeURIComponent(translateAuthError(error.message))}`);
        if (data?.session) return redirect("/"); // If email confirmation is disabled
        return redirect("/login?message=Compte+créé.+Vérifiez+votre+boîte+mail+pour+confirmer.");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col items-center mb-8">
                    <AfroSpyLogo className="w-16 h-16 shadow-orange-glow mb-4" />
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight text-center">
                        Créer un compte
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1 text-center">
                        Rejoignez AFRO SPY et commencez à espionner.
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
                            Mot de passe (min. 6 caractères)
                        </label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {searchParams?.error && (
                        <p className="mt-2 text-sm text-center font-bold text-red-500 bg-red-50 p-2 rounded-lg">
                            {searchParams.error}
                        </p>
                    )}

                    <div className="flex flex-col gap-3 mt-4">
                        <button
                            formAction={signUp}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-95 text-sm"
                        >
                            S'inscrire
                        </button>
                    </div>

                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">OU</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <GoogleAuthButton isSignUp />
                    </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500 font-medium">
                        Vous avez déjà un compte ?{" "}
                        <Link href="/login" className="text-orange-600 font-bold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-8 tracking-widest uppercase">Afro Spy © 2024</p>
        </div>
    );
}

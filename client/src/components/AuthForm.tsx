import { useState } from "react";
import { useAuth, FLAG_MAP } from "../contexts/AuthContext";

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, isLoading, error, clearError, country } = useAuth();

  // ✅ FIX : Toujours utiliser FLAG_MAP pour le bon emoji
  const countryFlag = country ? (FLAG_MAP[country.code] || country.flag || "🌍") : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setEmail("");
      setPassword("");
      onSuccess?.();
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return (
    <div className="w-full space-y-4">

      {/* Erreur */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-400 flex items-center gap-3">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Adresse email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 text-sm transition outline-none focus:border-amber-400/50 focus:bg-white/8 focus:ring-2 focus:ring-amber-400/10"
            placeholder="vous@example.com"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-600 text-sm transition outline-none focus:border-amber-400/50 focus:bg-white/8 focus:ring-2 focus:ring-amber-400/10"
            placeholder="••••••••"
          />
        </div>

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-red-500 to-emerald-500 text-white font-black text-sm tracking-wide shadow-lg transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Chargement..."
            : isLogin
              ? `Accéder à mon espace ${countryFlag || ""}`
              : "Créer mon compte"}
        </button>
      </form>

      {/* Switcher login / register */}
      <div className="text-center pt-2 text-sm text-slate-500">
        {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
        <button
          type="button"
          onClick={() => { setIsLogin(!isLogin); clearError(); }}
          className="font-bold text-amber-400 hover:text-amber-300 transition"
        >
          {isLogin ? "S'inscrire" : "Se connecter"}
        </button>
      </div>
    </div>
  );
}

export default AuthForm;
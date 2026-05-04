import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse, Country } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  country: Country | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Codes ISO 2 lettres — compatibles tous navigateurs
export const FLAG_MAP: Record<string, string> = {
  // Afrique de l'Ouest
  sn: "🇸🇳", ci: "🇨🇮", ml: "🇲🇱", gh: "🇬🇭", ng: "🇳🇬",
  bj: "🇧🇯", bf: "🇧🇫", gn: "🇬🇳", gw: "🇬🇼", cv: "🇨🇻",
  gm: "🇬🇲", lr: "🇱🇷", mr: "🇲🇷", ne: "🇳🇪", sl: "🇸🇱", tg: "🇹🇬",
  // Afrique Centrale
  cg: "🇨🇬", cd: "🇨🇩", ga: "🇬🇦", td: "🇹🇩", cf: "🇨🇫",
  cm: "🇨🇲", gq: "🇬🇶", st: "🇸🇹", bi: "🇧🇮", rw: "🇷🇼",
  // Afrique de l'Est
  ke: "🇰🇪", ug: "🇺🇬", tz: "🇹🇿", et: "🇪🇹", so: "🇸🇴",
  dj: "🇩🇯", er: "🇪🇷", ss: "🇸🇸", sd: "🇸🇩",
  mg: "🇲🇬", mu: "🇲🇺", sc: "🇸🇨", km: "🇰🇲",
  // Afrique Australe
  za: "🇿🇦", ao: "🇦🇴", zm: "🇿🇲", zw: "🇿🇼", mz: "🇲🇿",
  mw: "🇲🇼", bw: "🇧🇼", na: "🇳🇦", ls: "🇱🇸", sz: "🇸🇿",
  // Afrique du Nord
  ma: "🇲🇦", dz: "🇩🇿", tn: "🇹🇳", ly: "🇱🇾", eg: "🇪🇬",
};

// ✅ Liste des codes pays valides (pour validation du path en production)
const VALID_COUNTRY_CODES = Object.keys(FLAG_MAP);

function getCountryCodeFromHostname(): string | null {
  const hostname = window.location.hostname.toLowerCase();

  // ✅ EN LOCAL : détecte depuis le sous-domaine (comportement existant)
  const localRootHosts = ["localhost", "afri-hub.localhost", "127.0.0.1"];
  if (localRootHosts.includes(hostname)) return null;

  const localMatch = hostname.match(/^([a-z0-9-]+)\.localhost/) || hostname.match(/^([a-z0-9-]+)\.afri-hub\.localhost/);
  if (localMatch) return localMatch[1];

  // ✅ EN PRODUCTION : détecte depuis le pathname (/sn, /ml, /ci...)
  const isProdHost = hostname === "afri-hub.com" || hostname === "www.afri-hub.com" || hostname.endsWith(".vercel.app");
  if (isProdHost) {
    const pathname = window.location.pathname;
    const pathParts = pathname.split("/").filter(Boolean);
    const firstPart = pathParts[0]?.toLowerCase();
    if (firstPart && VALID_COUNTRY_CODES.includes(firstPart)) {
      return firstPart;
    }
    return null;
  }

  return null;
}

function buildApiBaseUrl(): string {
  return `http://${window.location.hostname}:4000/api`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [country, setCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || buildApiBaseUrl();
  const detectedCountryCode = getCountryCodeFromHostname();

  const fetchCurrentCountry = async () => {
    if (!detectedCountryCode) return;
    try {
      const response = await fetch(`${apiBaseUrl}/countries/${detectedCountryCode}`);
      if (response.ok) {
        const countryData: Country = await response.json();
        countryData.flag = FLAG_MAP[countryData.code?.toLowerCase()] || countryData.flag || "🌍";
        setCountry(countryData);
      }
    } catch (err) { console.warn("Erreur pays:", err); }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");
    if (storedToken && storedUser) {
      try { setToken(storedToken); setUser(JSON.parse(storedUser)); }
      catch { localStorage.removeItem("authToken"); localStorage.removeItem("authUser"); }
    }
    fetchCurrentCountry();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, countryCode: detectedCountryCode }),
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.error || "Erreur connexion"); }
      const data: AuthResponse = await response.json();
      setToken(data.token); setUser(data.user);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
    } catch (err) { const message = err instanceof Error ? err.message : "Erreur réseau"; setError(message); throw err; }
    finally { setIsLoading(false); }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true); setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, countryCode: detectedCountryCode }),
      });
      if (!response.ok) { const e = await response.json(); throw new Error(e.error || "Erreur inscription"); }
      const data: AuthResponse = await response.json();
      setToken(data.token); setUser(data.user);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.user));
    } catch (err) { const message = err instanceof Error ? err.message : "Erreur réseau"; setError(message); throw err; }
    finally { setIsLoading(false); }
  };

  const logout = () => {
    setUser(null); setToken(null); setError(null);
    localStorage.removeItem("authToken"); localStorage.removeItem("authUser");
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, token, country, isAuthenticated: !!token, login, register, logout, clearError, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
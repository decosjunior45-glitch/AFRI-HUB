import { useEffect, useState } from "react";
import { Item } from "./types";
import ItemManager from "./components/ItemManager";
import AuthForm from "./components/AuthForm";
import { useAuth } from "./contexts/AuthContext";

const apiBaseUrl = `http://${window.location.hostname}:4000/api`;

interface Country {
  code: string;
  name: string;
  flag: string;
}

function App() {
  const { isAuthenticated, token, logout, user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const countryResponse = await fetch(`${apiBaseUrl}/countries/current`);
        if (!countryResponse.ok) {
          throw new Error("Impossible de détecter le pays actuel");
        }

        const countryData: Country = await countryResponse.json();
        setCountry(countryData);

        const itemsResponse = await fetch(`${apiBaseUrl}/items`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!itemsResponse.ok) {
          throw new Error("Impossible de charger les éléments");
        }

        const itemsData: Item[] = await itemsResponse.json();
        setItems(itemsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur réseau");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isAuthenticated, token]);

  const refreshItems = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/items`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Erreur de rafraîchissement");
      setItems(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl p-6">
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-green-700">AFRI-HUB 🌍</h1>
            <p className="mt-2 text-slate-500 text-sm md:text-base">Gestion simple d'items avec React, Tailwind et MongoDB</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-4">
            {country && <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">🌍 {country.name}</div>}

            <div className="flex items-center gap-3">
              <div className="text-sm">
                <p className="text-slate-900 font-semibold">{user?.email}</p>
                <p className="text-slate-500 text-xs">{user?.countryCode}</p>
              </div>

              <button
                onClick={logout}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Items</h2>
              <button
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                onClick={refreshItems}
              >
                Actualiser
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500">Chargement des éléments…</div>
            ) : error ? (
              <div className="rounded-2xl bg-rose-50 p-4 text-rose-700">{error}</div>
            ) : (
              <ItemManager items={items} onItemsUpdated={setItems} apiBaseUrl={apiBaseUrl} token={token} />
            )}
          </div>

          <aside className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
            <h3 className="mb-4 text-xl font-semibold">Aide rapide</h3>
            <ul className="space-y-3 text-sm leading-6 text-slate-200">
              <li>Utilisez le formulaire pour créer un nouvel item.</li>
              <li>Cliquez sur les actions pour basculer ou supprimer.</li>
              <li>Ce projet est connecté à un backend Express et MongoDB.</li>
            </ul>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;

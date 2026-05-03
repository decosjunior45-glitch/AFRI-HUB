import { useState } from "react";
import { Item } from "../types";

interface ItemManagerProps {
  items: Item[];
  apiBaseUrl: string;
  onItemsUpdated: (items: Item[]) => void;
  token?: string | null;
}

function ItemManager({ items, apiBaseUrl, onItemsUpdated, token }: ItemManagerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  const createItem = async () => {
    if (!title.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders ?? {})
        },
        body: JSON.stringify({ title, description, completed: false })
      });

      if (!response.ok) {
        throw new Error("Impossible de créer l’item");
      }

      const createdItem = await response.json();
      onItemsUpdated([createdItem, ...items]);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompleted = async (item: Item) => {
    await fetch(`${apiBaseUrl}/items/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(authHeaders ?? {})
      },
      body: JSON.stringify({ completed: !item.completed })
    });
    onItemsUpdated(items.map((current) => (current._id === item._id ? { ...current, completed: !current.completed } : current)));
  };

  const deleteItem = async (item: Item) => {
    await fetch(`${apiBaseUrl}/items/${item._id}`, {
      method: "DELETE",
      headers: {
        ...(authHeaders ?? {})
      }
    });
    onItemsUpdated(items.filter((current) => current._id !== item._id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/40">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Ajouter un nouvel item</h3>
            <p className="mt-1 text-sm text-slate-600">Créez une tâche pour votre espace pays.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
            Nouveau
          </span>
        </div>

        <div className="space-y-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
            placeholder="Titre"
          />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
            placeholder="Description"
            rows={4}
          />
          <button
            disabled={loading}
            onClick={createItem}
            className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-slate-600 shadow-sm shadow-slate-200/40">
            Aucun item
          </div>
        ) : (
          items.map((item) => (
            <article key={item._id} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    item.completed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {item.completed ? "✔ Terminé" : "⏳ En attente"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => toggleCompleted(item)}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {item.completed ? "Annuler" : "Terminer"}
                </button>

                <button
                  onClick={() => deleteItem(item)}
                  className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default ItemManager;

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

type AnnouncementType = "emploi" | "evenement" | "service" | "vente";

interface Announcement {
  _id: string;
  title: string;
  description: string;
  type: AnnouncementType;
  countryCode: string;
  authorEmail: string;
  contact?: string;
  location?: string;
  price?: string;
  dateEvent?: string;
  imageBase64?: string;
  imageType?: string;
  pdfBase64?: string;
  pdfName?: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<AnnouncementType, { label: string; icon: string; color: string; bg: string }> = {
  emploi:    { label: "Emploi",    icon: "💼", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  evenement: { label: "Événement", icon: "📅", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  service:   { label: "Service",   icon: "🔧", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  vente:     { label: "Vente",     icon: "🛒", color: "#f43f5e", bg: "rgba(244,63,94,0.12)" },
};

const ADMIN_EMAIL = "admin@afri-hub.com";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface Props { isDark: boolean; apiBaseUrl: string; countryCode: string; }

export default function AnnouncementsPanel({ isDark, apiBaseUrl, countryCode }: Props) {
  const { token, user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AnnouncementType | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // ✅ Visionneuse plein écran
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", description: "", type: "emploi" as AnnouncementType,
    contact: "", location: "", price: "", dateEvent: "",
    imageBase64: "", imageType: "", imageName: "",
    pdfBase64: "", pdfName: "",
  });

  const isAdmin = user?.email === ADMIN_EMAIL;
  const crd = isDark ? "border-white/8 bg-white/4" : "border-slate-200 bg-white";
  const txt = isDark ? "text-white" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const inp = isDark
    ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-amber-400/50"
    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-400";

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/announcements?country=${countryCode}`);
      if (res.ok) setAnnouncements(await res.json());
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { if (countryCode) loadAnnouncements(); }, [countryCode]);

  // Fermer lightbox avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxSrc(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setFormError("Image trop grande (max 3 Mo)"); return; }
    if (!file.type.startsWith("image/")) { setFormError("Utilisez JPG, PNG ou WebP"); return; }
    setFormError("");
    const base64 = await fileToBase64(file);
    setPreviewImage(URL.createObjectURL(file));
    setForm(f => ({ ...f, imageBase64: base64, imageType: file.type, imageName: file.name }));
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFormError("PDF trop grand (max 5 Mo)"); return; }
    if (file.type !== "application/pdf") { setFormError("Seuls les PDF sont acceptés"); return; }
    setFormError("");
    const base64 = await fileToBase64(file);
    setForm(f => ({ ...f, pdfBase64: base64, pdfName: file.name }));
  };

  const removeImage = () => {
    setPreviewImage(null);
    setForm(f => ({ ...f, imageBase64: "", imageType: "", imageName: "" }));
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removePdf = () => {
    setForm(f => ({ ...f, pdfBase64: "", pdfName: "" }));
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) { setFormError("Titre et description obligatoires"); return; }
    setSubmitting(true); setFormError("");
    try {
      const payload = {
        title: form.title.trim(), description: form.description.trim(),
        type: form.type, contact: form.contact.trim(), location: form.location.trim(),
        price: form.price.trim(), dateEvent: form.dateEvent, countryCode,
        ...(form.imageBase64 && { imageBase64: form.imageBase64, imageType: form.imageType }),
        ...(form.pdfBase64 && { pdfBase64: form.pdfBase64, pdfName: form.pdfName }),
      };
      const res = await fetch(`${apiBaseUrl}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const e = await res.json(); setFormError(e.error || "Erreur"); return; }
      const newA = await res.json();
      setAnnouncements(prev => [newA, ...prev]);
      setForm({ title: "", description: "", type: "emploi", contact: "", location: "", price: "", dateEvent: "", imageBase64: "", imageType: "", imageName: "", pdfBase64: "", pdfName: "" });
      setPreviewImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      setShowForm(false);
      setSuccessMsg("Annonce publiée !");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch { setFormError("Erreur réseau"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await fetch(`${apiBaseUrl}/announcements/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch { }
  };

  const downloadPdf = (a: Announcement) => {
    if (!a.pdfBase64 || !a.pdfName) return;
    const link = document.createElement("a");
    link.href = `data:application/pdf;base64,${a.pdfBase64}`;
    link.download = a.pdfName;
    link.click();
  };

  const filtered = filter === "all" ? announcements : announcements.filter(a => a.type === filter);
  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); } catch { return ""; } };

  return (
    <div className="space-y-4">

      {/* ✅ LIGHTBOX plein écran */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem", cursor: "zoom-out"
          }}
        >
          <button
            onClick={() => setLightboxSrc(null)}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "white", borderRadius: "50%", width: 40, height: 40,
              fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >✕</button>
          <img
            src={lightboxSrc}
            alt="Zoom"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 12, objectFit: "contain", cursor: "default" }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className={`text-xs uppercase tracking-widest font-bold ${sub}`}>Communauté</p>
          <h3 className={`text-lg font-black ${txt}`}>Annonces du pays</h3>
        </div>
        {isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-black shadow-lg hover:brightness-110 transition">
            + Publier
          </button>
        )}
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400">✅ {successMsg}</div>
      )}

      {/* Formulaire admin */}
      {showForm && isAdmin && (
        <div className={`rounded-2xl border p-4 space-y-4 ${isDark ? "border-amber-500/20 bg-amber-500/5" : "border-amber-200 bg-amber-50"}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-amber-400" : "text-amber-600"}`}>Nouvelle annonce</p>
            <button onClick={() => { setShowForm(false); setFormError(""); removeImage(); removePdf(); }} className={`text-xs ${sub} hover:text-red-400 transition`}>✕ Fermer</button>
          </div>

          {/* Type */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.entries(TYPE_CONFIG) as [AnnouncementType, any][]).map(([key, cfg]) => (
              <button key={key} onClick={() => setForm(f => ({ ...f, type: key }))}
                className={`py-2.5 rounded-xl text-xs font-bold transition border flex flex-col items-center gap-1 ${
                  form.type === key ? "border-amber-400 bg-amber-400/20 text-amber-400"
                  : isDark ? "border-white/10 bg-white/3 text-slate-400" : "border-slate-200 bg-white text-slate-500"
                }`}>
                <span style={{ fontSize: 18 }}>{cfg.icon}</span><span>{cfg.label}</span>
              </button>
            ))}
          </div>

          <div>
            <p className={`text-xs font-semibold mb-1.5 ${sub}`}>Titre *</p>
            <input placeholder="Titre de l'annonce..." value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition ${inp}`} />
          </div>

          <div>
            <p className={`text-xs font-semibold mb-1.5 ${sub}`}>Description *</p>
            <textarea placeholder="Décrivez l'annonce en détail..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition resize-none ${inp}`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className={`text-xs font-semibold mb-1.5 ${sub}`}>Contact</p>
              <input placeholder="Téléphone ou email" value={form.contact}
                onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition ${inp}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold mb-1.5 ${sub}`}>Lieu / Ville</p>
              <input placeholder="Ex: Dakar, Plateau" value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition ${inp}`} />
            </div>
            {form.type === "vente" && (
              <div>
                <p className={`text-xs font-semibold mb-1.5 ${sub}`}>Prix</p>
                <input placeholder="Ex: 150 000 FCFA" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition ${inp}`} />
              </div>
            )}
            {form.type === "evenement" && (
              <div>
                <p className={`text-xs font-semibold mb-1.5 ${sub}`}>Date</p>
                <input type="date" value={form.dateEvent}
                  onChange={e => setForm(f => ({ ...f, dateEvent: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition ${inp}`} />
              </div>
            )}
          </div>

          {/* Upload image + PDF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className={`text-xs font-semibold mb-1.5 ${sub}`}>📷 Image (JPG/PNG — max 3 Mo)</p>
              {previewImage ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10">
                  <img src={previewImage} alt="preview" className="w-full object-cover" style={{ height: 120 }} />
                  <button onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-500/80 transition">✕</button>
                </div>
              ) : (
                <div onClick={() => imageInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${isDark ? "border-white/15 hover:border-amber-400/40 hover:bg-white/3" : "border-slate-300 hover:border-amber-400 hover:bg-amber-50"}`}
                  style={{ height: 120 }}>
                  <span className="text-2xl mb-1">🖼️</span>
                  <p className={`text-xs ${sub}`}>Cliquer pour ajouter</p>
                </div>
              )}
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            <div>
              <p className={`text-xs font-semibold mb-1.5 ${sub}`}>📄 Document PDF (max 5 Mo)</p>
              {form.pdfName ? (
                <div className={`rounded-xl border flex flex-col items-center justify-center gap-2 ${isDark ? "border-white/10 bg-white/3" : "border-slate-200 bg-slate-50"}`} style={{ height: 120 }}>
                  <span className="text-3xl">📄</span>
                  <p className={`text-xs font-semibold text-center px-2 truncate max-w-full ${txt}`}>{form.pdfName}</p>
                  <button onClick={removePdf} className="text-xs text-red-400 hover:text-red-300 transition">Supprimer</button>
                </div>
              ) : (
                <div onClick={() => pdfInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${isDark ? "border-white/15 hover:border-blue-400/40 hover:bg-white/3" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"}`}
                  style={{ height: 120 }}>
                  <span className="text-2xl mb-1">📄</span>
                  <p className={`text-xs ${sub}`}>Cliquer pour ajouter</p>
                </div>
              )}
              <input ref={pdfInputRef} type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
            </div>
          </div>

          {formError && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">⚠️ {formError}</div>}

          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-white text-sm font-black hover:brightness-110 transition disabled:opacity-50">
              {submitting ? "Publication..." : "✓ Publier l'annonce"}
            </button>
            <button onClick={() => { setShowForm(false); setFormError(""); removeImage(); removePdf(); }}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${isDark ? "bg-white/8 text-slate-400" : "bg-slate-200 text-slate-600"}`}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {[{ key: "all", label: "Tout", icon: "📌" }, ...Object.entries(TYPE_CONFIG).map(([k, v]) => ({ key: k, label: v.label, icon: v.icon }))].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border flex-shrink-0 ${
              filter === f.key ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : isDark ? "border-white/8 bg-white/3 text-slate-400 hover:bg-white/8" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}>
            <span style={{ fontSize: 13 }}>{f.icon}</span><span>{f.label}</span>
          </button>
        ))}
        {announcements.length > 0 && (
          <span className={`ml-auto flex-shrink-0 text-xs self-center ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            {filtered.length} annonce{filtered.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Liste */}
      {loading ? (
        <div className={`rounded-2xl border p-8 text-center ${crd}`}><p className={`text-sm ${sub}`}>Chargement...</p></div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${crd}`}>
          <p className="text-3xl mb-3">📢</p>
          <p className={`font-semibold text-sm ${sub}`}>{announcements.length === 0 ? "Aucune annonce pour l'instant" : "Aucune annonce dans cette catégorie"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => {
            const cfg = TYPE_CONFIG[a.type];
            const imgSrc = a.imageBase64 ? `data:${a.imageType};base64,${a.imageBase64}` : null;
            return (
              <div key={a._id} className={`rounded-2xl border overflow-hidden transition group ${crd}`} style={{ borderLeft: `3px solid ${cfg.color}` }}>

                {/* ✅ Image cliquable → lightbox */}
                {imgSrc && (
                  <div className="relative overflow-hidden" style={{ maxHeight: 220 }}>
                    <img
                      src={imgSrc} alt={a.title}
                      className="w-full object-cover cursor-zoom-in transition hover:brightness-90"
                      style={{ maxHeight: 220, objectFit: "cover" }}
                      onClick={() => setLightboxSrc(imgSrc)}
                    />
                    {/* Hint zoom */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                      🔍 Cliquer pour zoomer
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDelete(a._id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500/80 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition">
                        ✕
                      </button>
                    )}
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm leading-tight ${txt}`}>{a.title}</p>
                        <p className={`text-xs mt-1.5 leading-relaxed ${sub}`}>{a.description}</p>
                      </div>
                    </div>
                    {isAdmin && !imgSrc && (
                      <button onClick={() => handleDelete(a._id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 text-xs transition flex-shrink-0">✕</button>
                    )}
                  </div>

                  {(a.location || a.contact || a.price || a.dateEvent || a.pdfName) && (
                    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 mt-3 pt-3 border-t text-xs ${isDark ? "border-white/8" : "border-slate-100"} ${sub}`}>
                      {a.location && <span>📍 {a.location}</span>}
                      {a.contact && <span>📞 {a.contact}</span>}
                      {a.price && <span style={{ color: cfg.color, fontWeight: 700 }}>💰 {a.price}</span>}
                      {a.dateEvent && <span>📅 {formatDate(a.dateEvent)}</span>}
                      {a.pdfBase64 && a.pdfName && (
                        <button onClick={() => downloadPdf(a)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition hover:brightness-110"
                          style={{ color: "#3b82f6", background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.25)" }}>
                          📄 Télécharger le document ↓
                        </button>
                      )}
                      <span className={`ml-auto ${isDark ? "text-slate-600" : "text-slate-300"}`}>{formatDate(a.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
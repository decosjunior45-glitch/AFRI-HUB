import { useEffect, useMemo, useState, useRef } from "react";
import { Item } from "./types";
import AuthForm from "./components/AuthForm";
import ItemManager from "./components/ItemManager";
import { useAuth, FLAG_MAP } from "./contexts/AuthContext";
import AnnouncementsPanel from "./components/AnnouncementsPanel";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:4000/api`;

interface Country { code: string; name: string; flag: string; phoneCode: string; }

const CULTURE: Record<string, { capital: string; population: string; currency: string; languages: string[]; dishes: string[]; ethnicities: string[]; tagline: string; region: string; }> = {
  sn: { capital:"Dakar",        population:"17M",  currency:"Franc CFA (XOF)", languages:["Wolof","Français","Sérère","Peul"],        dishes:["Thiéboudienne","Yassa","Mafé"],           ethnicities:["Wolof","Sérère","Peul","Diola"],       tagline:"La Teranga — Pays de l'hospitalité",      region:"Afrique de l'Ouest" },
  ci: { capital:"Abidjan",      population:"27M",  currency:"Franc CFA (XOF)", languages:["Français","Dioula","Baoulé"],              dishes:["Attiéké","Kedjenou","Placali"],            ethnicities:["Akan","Mandé","Krou"],                 tagline:"Le pays de la paix et de la prospérité",  region:"Afrique de l'Ouest" },
  ml: { capital:"Bamako",       population:"22M",  currency:"Franc CFA (XOF)", languages:["Français","Bambara","Peul"],               dishes:["Tô","Tigadèguèna","Riz au gras"],          ethnicities:["Bambara","Peul","Dogon"],              tagline:"Berceau des grands empires africains",     region:"Afrique de l'Ouest" },
  gh: { capital:"Accra",        population:"32M",  currency:"Cedi (GHS)",      languages:["Anglais","Twi","Ewe","Ga"],                dishes:["Jollof rice","Fufu","Banku"],              ethnicities:["Akan","Ewe","Ga"],                     tagline:"Gateway to Africa",                       region:"Afrique de l'Ouest" },
  ng: { capital:"Abuja",        population:"220M", currency:"Naira (NGN)",     languages:["Anglais","Hausa","Yoruba","Igbo"],         dishes:["Jollof rice","Egusi","Suya"],              ethnicities:["Hausa","Yoruba","Igbo"],               tagline:"Giant of Africa",                         region:"Afrique de l'Ouest" },
  bj: { capital:"Cotonou",      population:"13M",  currency:"Franc CFA (XOF)", languages:["Français","Fon","Yoruba"],                dishes:["Pâte noire","Amiwo","Akpan"],              ethnicities:["Fon","Adja","Yoruba"],                 tagline:"Berceau du Vodoun",                       region:"Afrique de l'Ouest" },
  bf: { capital:"Ouagadougou",  population:"22M",  currency:"Franc CFA (XOF)", languages:["Français","Mooré","Dioula"],              dishes:["Tô","Riz sauce","Brochettes"],             ethnicities:["Mossi","Fulani","Lobi"],               tagline:"Le pays des hommes intègres",             region:"Afrique de l'Ouest" },
  gn: { capital:"Conakry",      population:"13M",  currency:"Franc guinéen",   languages:["Français","Peul","Malinké"],              dishes:["Riz sauce feuille","Fouti"],               ethnicities:["Peul","Malinké","Soussou"],            tagline:"Pays aux mille richesses",                region:"Afrique de l'Ouest" },
  gw: { capital:"Bissau",       population:"2M",   currency:"Franc CFA (XOF)", languages:["Portugais","Crioulo"],                   dishes:["Caldo de mancarra","Jollof"],              ethnicities:["Balanta","Fula","Mandingue"],          tagline:"Petit pays, grande culture",              region:"Afrique de l'Ouest" },
  cv: { capital:"Praia",        population:"0.6M", currency:"Escudo (CVE)",    languages:["Portugais","Criolo"],                    dishes:["Cachupa","Modje"],                         ethnicities:["Créoles","Africains"],                 tagline:"Land of Morabeza",                        region:"Afrique de l'Ouest" },
  gm: { capital:"Banjul",       population:"2.5M", currency:"Dalasi (GMD)",    languages:["Anglais","Mandingue","Wolof"],            dishes:["Benachin","Domoda"],                       ethnicities:["Mandingue","Fula","Wolof"],            tagline:"Le sourire de l'Afrique",                 region:"Afrique de l'Ouest" },
  lr: { capital:"Monrovia",     population:"5.4M", currency:"Dollar libérien", languages:["Anglais","Kpelle","Bassa"],               dishes:["Fufu","Palm butter"],                      ethnicities:["Kpelle","Bassa","Grebo"],              tagline:"The Love of Liberty",                     region:"Afrique de l'Ouest" },
  mr: { capital:"Nouakchott",   population:"4.6M", currency:"Ouguiya (MRU)",   languages:["Arabe","Peul","Soninké"],                 dishes:["Thiébou dieun","Méchoui"],                ethnicities:["Maures","Peul","Soninké"],             tagline:"Carrefour Maghreb et Afrique noire",      region:"Afrique de l'Ouest" },
  ne: { capital:"Niamey",       population:"25M",  currency:"Franc CFA (XOF)", languages:["Français","Haoussa","Zarma"],             dishes:["Dambou","Riz au gras"],                    ethnicities:["Haoussa","Zarma","Touareg"],           tagline:"Le Sahel au cœur de l'Afrique",           region:"Afrique de l'Ouest" },
  sl: { capital:"Freetown",     population:"8.1M", currency:"Leone (SLL)",     languages:["Anglais","Temne","Mende"],                dishes:["Cassava leaf","Jollof"],                   ethnicities:["Temne","Mende","Limba"],               tagline:"Lion Mountains",                          region:"Afrique de l'Ouest" },
  tg: { capital:"Lomé",         population:"8.7M", currency:"Franc CFA (XOF)", languages:["Français","Éwé","Kabiyé"],                dishes:["Akume","Gboma dessi"],                     ethnicities:["Éwé","Kabiyé","Tem"],                  tagline:"Le pays de l'hospitalité",                region:"Afrique de l'Ouest" },
  cm: { capital:"Yaoundé",      population:"27M",  currency:"Franc CFA (XAF)", languages:["Français","Anglais","Ewondo"],            dishes:["Ndolé","Eru","Mbanga soup"],               ethnicities:["Bamiléké","Beti","Fulani"],            tagline:"L'Afrique en miniature",                  region:"Afrique Centrale" },
  cg: { capital:"Brazzaville",  population:"5.8M", currency:"Franc CFA (XAF)", languages:["Français","Lingala","Kituba"],            dishes:["Poulet moambe","Saka-saka"],               ethnicities:["Kongo","Teke","Mboshi"],               tagline:"Cœur vert de l'Afrique",                  region:"Afrique Centrale" },
  cd: { capital:"Kinshasa",     population:"100M", currency:"Franc congolais",  languages:["Français","Lingala","Swahili"],           dishes:["Moambe","Saka-saka","Fufu"],               ethnicities:["Luba","Kongo","Mongo"],                tagline:"Le géant d'Afrique centrale",             region:"Afrique Centrale" },
  ga: { capital:"Libreville",   population:"2.3M", currency:"Franc CFA (XAF)", languages:["Français","Fang","Myene"],               dishes:["Nyembwe","Poulet DG"],                     ethnicities:["Fang","Mpongwé","Nzebi"],              tagline:"Le pays de l'équateur",                   region:"Afrique Centrale" },
  td: { capital:"N'Djamena",    population:"17M",  currency:"Franc CFA (XAF)", languages:["Français","Arabe","Sara"],               dishes:["Boule","Daraba","Aiysh"],                  ethnicities:["Sara","Arabes","Toubou"],              tagline:"Carrefour des civilisations africaines",  region:"Afrique Centrale" },
  cf: { capital:"Bangui",       population:"5.5M", currency:"Franc CFA (XAF)", languages:["Français","Sango"],                      dishes:["Gozo","Kanda ti nyma"],                    ethnicities:["Baya","Banda","Mandja"],               tagline:"Le cœur de l'Afrique",                    region:"Afrique Centrale" },
  gq: { capital:"Malabo",       population:"1.5M", currency:"Franc CFA (XAF)", languages:["Espagnol","Français","Fang"],             dishes:["Sopa de pescado","Mbanga"],                ethnicities:["Fang","Bubi","Ndowe"],                 tagline:"Pays de la forêt équatoriale",            region:"Afrique Centrale" },
  st: { capital:"São Tomé",     population:"0.2M", currency:"Dobra (STN)",     languages:["Portugais","Forro"],                     dishes:["Calulu","Cachupa"],                        ethnicities:["Forros","Angolares"],                  tagline:"Ilhas do meio do mundo",                  region:"Afrique Centrale" },
  bi: { capital:"Gitega",       population:"12M",  currency:"Franc burundais", languages:["Kirundi","Français","Swahili"],           dishes:["Ugali","Isombe"],                          ethnicities:["Hutu","Tutsi","Twa"],                  tagline:"Le pays vert du cœur de l'Afrique",       region:"Afrique Centrale" },
  rw: { capital:"Kigali",       population:"13M",  currency:"Franc rwandais",  languages:["Kinyarwanda","Français","Anglais"],       dishes:["Isombe","Ugali"],                          ethnicities:["Hutu","Tutsi","Twa"],                  tagline:"Le pays des mille collines",              region:"Afrique Centrale" },
  ke: { capital:"Nairobi",      population:"54M",  currency:"Shilling (KES)",  languages:["Swahili","Anglais","Kikuyu"],             dishes:["Ugali","Nyama choma","Chapati"],           ethnicities:["Kikuyu","Luhya","Luo"],                tagline:"The Cradle of Humanity",                  region:"Afrique de l'Est" },
  ug: { capital:"Kampala",      population:"46M",  currency:"Shilling (UGX)",  languages:["Anglais","Swahili","Luganda"],            dishes:["Matoke","Rolex","Posho"],                  ethnicities:["Baganda","Acholi","Basoga"],           tagline:"The Pearl of Africa",                     region:"Afrique de l'Est" },
  tz: { capital:"Dodoma",       population:"63M",  currency:"Shilling (TZS)",  languages:["Swahili","Anglais"],                     dishes:["Ugali","Pilau","Mishkaki"],                ethnicities:["Sukuma","Nyamwezi","Chaga"],           tagline:"Land of Kilimanjaro and Zanzibar",        region:"Afrique de l'Est" },
  et: { capital:"Addis-Abeba",  population:"120M", currency:"Birr (ETB)",      languages:["Amharique","Oromo","Tigrigna"],           dishes:["Injera","Doro wat","Kitfo"],               ethnicities:["Oromo","Amhara","Tigray"],             tagline:"Berceau de l'humanité",                   region:"Afrique de l'Est" },
  so: { capital:"Mogadiscio",   population:"17M",  currency:"Shilling (SOS)",  languages:["Somali","Arabe"],                        dishes:["Bariis iyo hilib","Canjeero"],             ethnicities:["Somalis","Bantous"],                   tagline:"La Corne de l'Afrique",                   region:"Afrique de l'Est" },
  dj: { capital:"Djibouti",     population:"1M",   currency:"Franc (DJF)",     languages:["Français","Arabe","Somali","Afar"],      dishes:["Skoudehkaris","Lahoh"],                    ethnicities:["Afar","Issa"],                         tagline:"Carrefour des civilisations",             region:"Afrique de l'Est" },
  er: { capital:"Asmara",       population:"3.5M", currency:"Nakfa (ERN)",     languages:["Tigrigna","Arabe","Anglais"],             dishes:["Injera","Zigni"],                          ethnicities:["Tigrinya","Tigre","Afar"],             tagline:"La Corée de l'Afrique",                   region:"Afrique de l'Est" },
  ss: { capital:"Juba",         population:"11M",  currency:"Livre (SSP)",     languages:["Anglais","Arabe","Dinka"],               dishes:["Asida","Ful medames"],                     ethnicities:["Dinka","Nuer","Shilluk"],              tagline:"Le plus jeune pays d'Afrique",            region:"Afrique de l'Est" },
  sd: { capital:"Khartoum",     population:"44M",  currency:"Livre (SDG)",     languages:["Arabe","Anglais","Nubien"],               dishes:["Ful medames","Asida"],                     ethnicities:["Arabes","Nubiens","Fur"],              tagline:"Terre des pharaons noirs",                region:"Afrique de l'Est" },
  mg: { capital:"Antananarivo", population:"28M",  currency:"Ariary (MGA)",    languages:["Malgache","Français"],                   dishes:["Romazava","Ravitoto"],                     ethnicities:["Merina","Betsimisaraka"],              tagline:"La grande île rouge",                     region:"Afrique de l'Est" },
  mu: { capital:"Port-Louis",   population:"1.3M", currency:"Roupie (MUR)",    languages:["Anglais","Français","Créole"],            dishes:["Dholl puri","Biryani"],                    ethnicities:["Indo-Mauriciens","Créoles"],           tagline:"Perle de l'océan Indien",                 region:"Afrique de l'Est" },
  sc: { capital:"Victoria",     population:"0.1M", currency:"Roupie (SCR)",    languages:["Créole","Anglais","Français"],            dishes:["Grilled fish","Ladob"],                    ethnicities:["Créoles","Indiens"],                   tagline:"Jewels of the Indian Ocean",              region:"Afrique de l'Est" },
  km: { capital:"Moroni",       population:"0.9M", currency:"Franc (KMF)",     languages:["Comorien","Arabe","Français"],            dishes:["Langouste","Pilao"],                       ethnicities:["Comoriens","Arabes"],                  tagline:"Perfume Islands",                         region:"Afrique de l'Est" },
  za: { capital:"Pretoria",     population:"60M",  currency:"Rand (ZAR)",      languages:["Zulu","Xhosa","Afrikaans","Anglais"],     dishes:["Braai","Bunny chow","Bobotie"],            ethnicities:["Zulu","Xhosa","Sotho"],                tagline:"Nation arc-en-ciel",                      region:"Afrique Australe" },
  ao: { capital:"Luanda",       population:"33M",  currency:"Kwanza (AOA)",    languages:["Portugais","Umbundu","Kimbundu"],         dishes:["Moamba de galinha","Calulu"],              ethnicities:["Ovimbundu","Mbundu","Bakongo"],        tagline:"Le géant de l'Afrique australe",          region:"Afrique Australe" },
  zm: { capital:"Lusaka",       population:"19M",  currency:"Kwacha (ZMW)",    languages:["Anglais","Bemba","Nyanja"],               dishes:["Nshima","Kapenta"],                        ethnicities:["Bemba","Tonga","Chewa"],               tagline:"The Real Africa",                         region:"Afrique Australe" },
  zw: { capital:"Harare",       population:"15M",  currency:"ZiG",             languages:["Shona","Ndebele","Anglais"],              dishes:["Sadza","Nyama"],                           ethnicities:["Shona","Ndebele"],                     tagline:"Jewel of Africa",                         region:"Afrique Australe" },
  mz: { capital:"Maputo",       population:"32M",  currency:"Metical (MZN)",   languages:["Portugais","Emakhuwa"],                  dishes:["Piri piri prawns","Matapa"],               ethnicities:["Makua","Tsonga"],                      tagline:"Pérola do Índico",                        region:"Afrique Australe" },
  mw: { capital:"Lilongwe",     population:"19M",  currency:"Kwacha (MWK)",    languages:["Chichewa","Anglais"],                    dishes:["Nsima","Chambo"],                          ethnicities:["Chewa","Tumbuka"],                     tagline:"The Warm Heart of Africa",                region:"Afrique Australe" },
  bw: { capital:"Gaborone",     population:"2.6M", currency:"Pula (BWP)",      languages:["Setswana","Anglais"],                    dishes:["Seswaa","Bogobe"],                         ethnicities:["Tswana","Kalanga"],                    tagline:"Pula — The Rain",                         region:"Afrique Australe" },
  na: { capital:"Windhoek",     population:"2.6M", currency:"Dollar namibien", languages:["Anglais","Afrikaans","Oshiwambo"],        dishes:["Kapana","Oshifima"],                       ethnicities:["Ovambo","Kavango"],                    tagline:"Land of the Brave",                       region:"Afrique Australe" },
  ls: { capital:"Maseru",       population:"2.1M", currency:"Loti (LSL)",      languages:["Sesotho","Anglais"],                     dishes:["Papa","Moroho"],                           ethnicities:["Sotho","Zulu"],                        tagline:"Kingdom in the Sky",                      region:"Afrique Australe" },
  sz: { capital:"Mbabane",      population:"1.2M", currency:"Lilangeni (SZL)", languages:["SiSwati","Anglais"],                     dishes:["Sishwala","Emasi"],                        ethnicities:["Swazis"],                              tagline:"Africa's Hidden Kingdom",                 region:"Afrique Australe" },
  ma: { capital:"Rabat",        population:"37M",  currency:"Dirham (MAD)",    languages:["Arabe","Amazigh","Français"],             dishes:["Couscous","Tajine","Pastilla"],            ethnicities:["Arabes","Berbères"],                   tagline:"Royaume du Maroc — Porte de l'Afrique",  region:"Afrique du Nord" },
  dz: { capital:"Alger",        population:"44M",  currency:"Dinar (DZD)",     languages:["Arabe","Tamazight","Français"],           dishes:["Couscous","Chakhchoukha"],                ethnicities:["Arabes","Berbères","Touaregs"],        tagline:"Le pays du million de martyrs",           region:"Afrique du Nord" },
  tn: { capital:"Tunis",        population:"12M",  currency:"Dinar (TND)",     languages:["Arabe","Tamazight","Français"],           dishes:["Couscous","Brik","Lablabi"],              ethnicities:["Arabes","Berbères"],                   tagline:"Au cœur de la Méditerranée",              region:"Afrique du Nord" },
  ly: { capital:"Tripoli",      population:"7M",   currency:"Dinar (LYD)",     languages:["Arabe","Berbère"],                       dishes:["Bazeen","Asida"],                          ethnicities:["Arabes","Berbères"],                   tagline:"Terre des déserts et de la mer",          region:"Afrique du Nord" },
  eg: { capital:"Le Caire",     population:"104M", currency:"Livre (EGP)",     languages:["Arabe","Copte"],                         dishes:["Kushari","Ful medames","Molokheyya"],      ethnicities:["Égyptiens","Nubiens"],                 tagline:"Mère du monde — Umm al-Dunia",            region:"Afrique du Nord" },
};

// ✅ DRAPEAUX EN IMAGE — fonctionne sur Windows, Mac, Linux, partout
function Flag({ code, size = 48 }: { code: string; size?: number }) {
  const iso = code?.toLowerCase();
  const w = size;
  const h = Math.round(size * 0.67);
  return (
    <img
      src={`https://flagcdn.com/w80/${iso}.png`}
      alt={iso}
      width={w}
      height={h}
      style={{ width: w, height: h, objectFit: "cover", borderRadius: Math.round(size * 0.08), flexShrink: 0, display: "inline-block", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
      onError={(e) => {
        // Fallback si image non trouvée
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div style="width:${w}px;height:${h}px;border-radius:${Math.round(size*0.08)}px;background:linear-gradient(135deg,#D4AF37,#CC0000,#006400);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="color:white;font-weight:900;font-size:${Math.round(size*0.28)}px">${iso.toUpperCase()}</span></div>`;
        }
      }}
    />
  );
}

function AfricaLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs><linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#D4AF37"/><stop offset="45%" stopColor="#CC0000"/><stop offset="100%" stopColor="#006400"/></linearGradient></defs>
      <path d="M38 8 C32 8 26 12 24 18 C20 16 16 18 16 24 C14 28 16 32 18 35 C16 40 17 46 20 50 C18 55 19 62 22 67 C25 74 30 80 36 86 C40 90 44 94 50 96 C54 94 57 90 60 86 C65 80 68 74 70 68 C72 62 73 56 71 50 C74 45 76 38 74 33 C72 28 70 24 66 22 C68 18 66 13 62 10 C58 8 54 9 50 8 C46 7 42 8 38 8 Z" fill="url(#ag)" opacity="0.95"/>
      <circle cx="50" cy="52" r="4" fill="white" opacity="0.5"/>
    </svg>
  );
}

function RainEffect({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const drops = Array.from({ length: 130 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      speed: 5 + Math.random() * 9, length: 12 + Math.random() * 22, opacity: 0.06 + Math.random() * 0.14,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach(d => {
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 1.5, d.y + d.length);
        ctx.strokeStyle = isDark ? `rgba(147,210,255,${d.opacity})` : `rgba(80,140,200,${d.opacity * 0.4})`;
        ctx.lineWidth = 1; ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) { d.y = -d.length; d.x = Math.random() * canvas.width; }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [isDark]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.6 }} />;
}

interface Contact { id: string; name: string; role: string; phone: string; email: string; country: string; }
function ContactsManager({ isDark }: { isDark: boolean }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", phone: "", email: "", country: "" });
  const [search, setSearch] = useState("");
  const addContact = () => {
    if (!form.name.trim()) return;
    setContacts(prev => [{ id: Date.now().toString(), ...form }, ...prev]);
    setForm({ name: "", role: "", phone: "", email: "", country: "" }); setShowForm(false);
  };
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase()));
  const crd = isDark ? "border-white/8 bg-white/4" : "border-slate-200 bg-white";
  const inp = isDark ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-amber-400/50" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-400";
  const txt = isDark ? "text-white" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><p className={`text-xs uppercase tracking-widest font-bold ${sub}`}>Réseau</p><h2 className={`text-xl font-black ${txt}`}>Mes contacts</h2></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-black shadow-lg hover:brightness-110 transition">+ Ajouter</button>
      </div>
      {showForm && (
        <div className={`rounded-2xl border p-5 space-y-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
          <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-amber-400" : "text-amber-600"}`}>Nouveau contact</p>
          <div className="grid grid-cols-2 gap-3">
            {[{k:"name",p:"Nom complet *",t:"text",f:true},{k:"role",p:"Rôle / Métier",t:"text",f:false},{k:"phone",p:"Téléphone",t:"tel",f:false},{k:"email",p:"Email",t:"email",f:false},{k:"country",p:"Pays",t:"text",f:false}].map(field => (
              <input key={field.k} type={field.t} placeholder={field.p} value={form[field.k as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [field.k]: e.target.value }))}
                className={`px-3 py-2.5 rounded-xl text-sm outline-none transition border ${inp} ${field.f ? "col-span-2" : ""}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addContact} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-white text-sm font-black hover:brightness-110 transition">Enregistrer</button>
            <button onClick={() => setShowForm(false)} className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${isDark ? "bg-white/8 text-slate-400" : "bg-slate-200 text-slate-600"}`}>Annuler</button>
          </div>
        </div>
      )}
      {contacts.length > 0 && <input type="text" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition border ${inp}`} />}
      {filtered.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center ${isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50"}`}>
          <p className="text-3xl mb-3">👥</p>
          <p className={`font-semibold text-sm ${sub}`}>{contacts.length === 0 ? "Votre réseau est vide pour l'instant" : "Aucun résultat"}</p>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>{contacts.length === 0 ? "Ajoutez votre premier contact" : "Essayez un autre mot-clé"}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(c => (
            <div key={c.id} className={`rounded-2xl p-4 transition group border ${crd} ${isDark ? "hover:bg-white/8" : "hover:bg-slate-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-black text-white">{c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div><p className={`font-bold text-sm ${txt}`}>{c.name}</p>{c.role && <p className={`text-xs ${sub}`}>{c.role}</p>}</div>
                </div>
                <button onClick={() => setContacts(prev => prev.filter(x => x.id !== c.id))} className="opacity-0 group-hover:opacity-100 text-red-400 text-xs transition">✕</button>
              </div>
              <div className={`mt-3 pt-3 border-t space-y-1 ${isDark ? "border-white/8" : "border-slate-100"}`}>
                {c.phone && <p className={`text-xs flex gap-2 ${sub}`}><span>📞</span>{c.phone}</p>}
                {c.email && <p className={`text-xs flex gap-2 truncate ${sub}`}><span>✉️</span>{c.email}</p>}
                {c.country && <p className={`text-xs flex gap-2 ${sub}`}><span>🌍</span>{c.country}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const { isAuthenticated, token, logout, user, country: authCountry } = useAuth();
  const [country, setCountry] = useState<Country | null>(null);
  const [availableCountries, setAvailableCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "contacts" | "profile">("dashboard");
  const [countrySearch, setCountrySearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hostname = window.location.hostname.toLowerCase();
  const isRootHost = hostname === "afri-hub.localhost" || hostname === "localhost" || hostname === "127.0.0.1";
  const portSuffix = window.location.port ? `:${window.location.port}` : "";

  useEffect(() => {
    if (authCountry) setCountry({ ...authCountry, flag: FLAG_MAP[authCountry.code?.toLowerCase()] || authCountry.flag || "🌍" });
  }, [authCountry]);

  useEffect(() => {
    async function loadCountries() {
      setLoadingCountries(true);
      try {
        const res = await fetch(`${apiBaseUrl}/countries`);
        if (!res.ok) throw new Error();
        const data: Country[] = await res.json();
        setAvailableCountries(data.map(c => ({ ...c })));
      } catch { } finally { setLoadingCountries(false); }
    }
    loadCountries();
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) { setItems([]); return; }
    async function loadItems() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${apiBaseUrl}/items`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Impossible de charger");
        setItems(await res.json());
      } catch (err) { setError(err instanceof Error ? err.message : "Erreur réseau"); } finally { setLoading(false); }
    }
    loadItems();
  }, [isAuthenticated, token]);

  const stats = useMemo(() => ({
    total: items.length, completed: items.filter(i => i.completed).length, pending: items.filter(i => !i.completed).length,
  }), [items]);

  const resolvedCountry = country || authCountry;
  const culture = resolvedCountry ? CULTURE[resolvedCountry.code?.toLowerCase()] : null;

  const bg = isDark ? "bg-slate-950" : "bg-slate-100";
  const txt = isDark ? "text-white" : "text-slate-900";
  const sbar = isDark ? "bg-slate-900 border-white/5" : "bg-white border-slate-200";
  const crd = isDark ? "border-white/8 bg-white/4" : "border-slate-200 bg-white";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const inp = isDark ? "bg-white/5 border-white/10 text-white placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400";

  const ThemeBtn = () => (
    <button onClick={() => setIsDark(!isDark)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${isDark ? "border-white/10 bg-white/5 text-slate-300 hover:text-white" : "border-slate-200 bg-slate-100 text-slate-500 hover:text-slate-900"}`}>
      {isDark ? "🌙 Sombre" : "☀️ Clair"}
    </button>
  );

  if (isRootHost) {
    const filtered = availableCountries.filter(c =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.phoneCode.includes(countrySearch) || c.code.toLowerCase().includes(countrySearch.toLowerCase())
    );
    return (
      <div className={`min-h-screen ${bg} ${txt} flex flex-col transition-colors duration-300`}>
        <RainEffect isDark={isDark} />
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isDark ? "border-white/5 bg-slate-950/90" : "border-slate-200 bg-white/90"}`}>
            <div className="mx-auto max-w-2xl px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AfricaLogo size={36} />
                <div><h1 className={`text-base font-black ${txt}`}>AFRI-HUB</h1><p className={`text-xs font-medium tracking-widest uppercase ${isDark ? "text-amber-400/70" : "text-amber-600"}`}>Plateforme africaine</p></div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs ${sub}`}>{availableCountries.length > 0 ? `${availableCountries.length} pays` : "..."}</span>
                <ThemeBtn />
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col items-center px-6 py-16">
            <div className="w-full max-w-lg space-y-8">
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase ${isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Plateforme multi-pays
                </div>
                <h2 className={`text-4xl sm:text-5xl font-black tracking-tight leading-none ${txt}`}>
                  Votre espace<br /><span className="bg-gradient-to-r from-amber-400 via-red-400 to-emerald-400 bg-clip-text text-transparent">en Afrique</span>
                </h2>
                <p className={`text-sm leading-relaxed ${sub}`}>Chaque pays, un espace dédié. Trouvez le vôtre.</p>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-lg">🔍</div>
                <input type="text" placeholder="Sénégal, Tchad, Maroc, Égypte..." value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  className={`w-full pl-12 pr-5 py-4 rounded-2xl border text-sm outline-none transition ${inp} focus:ring-2 focus:ring-amber-400/20`} autoFocus />
              </div>

              {countrySearch.trim() ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {loadingCountries ? (
                    <div className={`text-center py-8 text-sm ${sub}`}>Chargement...</div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-2xl mb-2">🤔</p>
                      <p className={`text-sm font-medium ${sub}`}>Aucun pays trouvé</p>
                    </div>
                  ) : (
                    <>
                      {filtered.map(c => (
                        <button key={c.code}
                          onClick={() => { window.location.href = `${window.location.protocol}//${c.code}.localhost${portSuffix}`; }}
                          className={`w-full group flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${isDark ? "border-white/5 bg-white/3 hover:bg-white/8 hover:border-amber-400/30" : "border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300"}`}>
                          <Flag code={c.code} size={48} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-base truncate ${txt}`}>{c.name}</p>
                            <p className={`text-xs mt-0.5 ${sub}`}>
                              {CULTURE[c.code] ? `${CULTURE[c.code].capital} · ${CULTURE[c.code].region}` : "Afrique"}
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${isDark ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-emerald-700 bg-emerald-50 border-emerald-200"}`}>{c.phoneCode}</span>
                        </button>
                      ))}
                      <p className={`text-center text-xs pt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                        {filtered.length} pays trouvé{filtered.length > 1 ? "s" : ""}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 space-y-4">
                  <div className="flex gap-4 opacity-30">
                    <Flag code="sn" size={40} />
                    <Flag code="ng" size={40} />
                    <Flag code="eg" size={40} />
                    <Flag code="za" size={40} />
                  </div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Commencez à taper pour trouver votre pays
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-700" : "text-slate-300"}`}>
                    {availableCountries.length > 0 ? `${availableCountries.length} pays africains disponibles` : "Chargement..."}
                  </p>
                </div>
              )}
            </div>
          </main>
          <footer className={`border-t py-4 text-center ${isDark ? "border-white/5" : "border-slate-200"}`}>
            <p className={`text-xs ${isDark ? "text-slate-700" : "text-slate-400"}`}>© 2026 AFRI-HUB · Plateforme Multi-pays Africaine</p>
          </footer>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${bg} ${txt} flex flex-col transition-colors duration-300`}>
        <RainEffect isDark={isDark} />
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${isDark ? "border-white/5 bg-slate-950/90" : "border-slate-200 bg-white/90"}`}>
            <div className="mx-auto max-w-lg px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><AfricaLogo size={30} /><span className={`font-black text-sm ${txt}`}>AFRI-HUB</span></div>
              <div className="flex items-center gap-3">
                {resolvedCountry && <Flag code={resolvedCountry.code} size={32} />}
                <ThemeBtn />
              </div>
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-lg px-4 py-8 space-y-5">
            {showWelcome && culture && resolvedCountry ? (
              <div className="space-y-4">
                <div className={`rounded-3xl border p-8 text-center space-y-4 ${crd}`}>
                  <div className="flex justify-center"><Flag code={resolvedCountry.code} size={96} /></div>
                  <h1 className={`text-3xl font-black ${txt}`}>{resolvedCountry.name}</h1>
                  <p className={`text-sm font-medium italic ${isDark ? "text-amber-400/80" : "text-amber-600"}`}>{culture.tagline}</p>
                  <div className={`flex items-center justify-center gap-4 text-xs ${sub}`}>
                    <span>🏙️ {culture.capital}</span><span>·</span><span>👥 {culture.population}</span><span>·</span><span>💰 {culture.currency}</span>
                  </div>
                </div>
                {[
                  { label: "🗣️ Langues parlées", color: isDark ? "text-amber-400" : "text-amber-600", items: culture.languages },
                  { label: "🍽️ Plats traditionnels", color: isDark ? "text-emerald-400" : "text-emerald-600", items: culture.dishes },
                  { label: "👥 Ethnies principales", color: isDark ? "text-red-400" : "text-red-500", items: culture.ethnicities },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl border p-5 ${crd}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.color}`}>{s.label}</p>
                    <div className="flex flex-wrap gap-2">{s.items.map(i => <span key={i} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${isDark ? "text-slate-200 bg-white/8 border-white/10" : "text-slate-700 bg-slate-100 border-slate-200"}`}>{i}</span>)}</div>
                  </div>
                ))}
                <button onClick={() => setShowWelcome(false)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-red-500 to-emerald-500 font-black text-white text-base hover:brightness-110 transition shadow-lg">Accéder à mon espace →</button>
                <a href="http://afri-hub.localhost:5173" className={`block text-center text-xs transition ${isDark ? "text-slate-600 hover:text-slate-400" : "text-slate-400 hover:text-slate-600"}`}>← Changer de pays</a>
              </div>
            ) : (
              <div className="space-y-4">
                {resolvedCountry && (
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${crd}`}>
                    <Flag code={resolvedCountry.code} size={48} />
                    <div><p className={`font-bold text-sm ${txt}`}>{resolvedCountry.name}</p><p className={`text-xs font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{resolvedCountry.phoneCode}</p></div>
                  </div>
                )}
                <div className={`rounded-3xl border p-6 ${crd}`}>
                  <div className="text-center mb-5"><AfricaLogo size={44} /><h2 className={`text-2xl font-black mt-3 ${txt}`}>Connexion</h2><p className={`text-xs mt-1 ${sub}`}>Accédez à votre espace {resolvedCountry?.name}</p></div>
                  <AuthForm />
                </div>
                {culture && <button onClick={() => setShowWelcome(true)} className={`block w-full text-center text-xs transition ${isDark ? "text-slate-600 hover:text-amber-400" : "text-slate-400 hover:text-amber-600"}`}>← Retour à la présentation</button>}
                <a href="http://afri-hub.localhost:5173" className={`block text-center text-xs transition ${isDark ? "text-slate-600 hover:text-slate-400" : "text-slate-400 hover:text-slate-600"}`}>← Changer de pays</a>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-5">
      <div className={`rounded-3xl border p-6 ${crd}`}>
        <div className="flex items-center gap-5">
          <Flag code={resolvedCountry?.code || ""} size={72} />
          <div>
            <p className={`text-xs uppercase tracking-widest ${sub}`}>Bienvenue dans votre espace</p>
            <h2 className={`text-2xl font-black ${txt}`}>{resolvedCountry?.name}</h2>
            {culture && <p className={`text-xs mt-0.5 italic ${isDark ? "text-amber-400/70" : "text-amber-600"}`}>{culture.tagline}</p>}
            {culture && <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{culture.region}</p>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: "🏙️", label: "Capitale", val: culture?.capital || "—", acc: false },
          { icon: "👥", label: "Population", val: culture?.population || "—", acc: false },
          { icon: "💰", label: "Monnaie", val: culture?.currency?.split(" ")[0] || "—", acc: false },
          { icon: "📞", label: "Indicatif", val: resolvedCountry?.phoneCode || "—", acc: true },
        ].map(i => (
          <div key={i.label} className={`rounded-2xl border p-4 text-center ${crd}`}>
            <p className="text-xl mb-1">{i.icon}</p>
            <p className={`text-xs uppercase tracking-wider mb-1 ${sub}`}>{i.label}</p>
            <p className={`text-sm font-black ${i.acc ? (isDark ? "text-emerald-400" : "text-emerald-600") : txt}`}>{i.val}</p>
          </div>
        ))}
      </div>
      {culture && (
        <div className={`rounded-2xl border p-5 ${crd}`}>
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? "text-amber-400" : "text-amber-600"}`}>🗣️ Langues de votre pays</p>
          <div className="flex flex-wrap gap-2">{culture.languages.map(l => <span key={l} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${isDark ? "text-slate-200 bg-white/8 border-white/10" : "text-slate-700 bg-slate-100 border-slate-200"}`}>{l}</span>)}</div>
        </div>
      )}

      {/* ANNONCES DU PAYS */}
      <div className={`rounded-2xl border p-5 ${crd}`}>
        <AnnouncementsPanel
          isDark={isDark}
          apiBaseUrl={apiBaseUrl}
          countryCode={resolvedCountry?.code || ""}
        />
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-4">
      <div className={`rounded-3xl border p-6 ${crd}`}>
        <p className={`text-xs uppercase tracking-widest mb-4 ${sub}`}>Mon profil</p>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-black text-white">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className={`font-bold ${txt}`}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Flag code={resolvedCountry?.code || ""} size={28} />
              <p className={`text-sm ${sub}`}>{resolvedCountry?.name} · {resolvedCountry?.phoneCode}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`rounded-2xl border p-5 ${crd}`}>
        <p className={`text-xs uppercase tracking-widest mb-3 ${sub}`}>Thème de l'interface</p>
        <div className="flex gap-3">
          {[{ label: "🌙 Sombre", dark: true }, { label: "☀️ Clair", dark: false }].map(t => (
            <button key={t.label} onClick={() => setIsDark(t.dark)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition border ${isDark === t.dark ? "bg-gradient-to-r from-amber-500 to-red-500 text-white border-transparent" : (isDark ? "bg-white/5 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500")}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <button onClick={logout} className="w-full py-3 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition">🚪 Se déconnecter</button>
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} ${txt} flex transition-colors duration-300`}>
      <RainEffect isDark={isDark} />
      {/* ✅ Overlay mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ✅ Bouton burger mobile */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className={`fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-xl shadow-lg border transition ${isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"}`}
      >
        ☰
      </button>

      <aside className={`fixed left-0 top-0 h-screen w-64 border-r flex flex-col z-40 transition-transform duration-300 ${sbar} ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className={`border-b p-5 flex items-center gap-3 ${isDark ? "border-white/5" : "border-slate-200"}`}>
          <AfricaLogo size={36} /><div><h1 className={`font-black text-sm ${txt}`}>AFRI-HUB</h1><p className={`text-xs font-medium ${isDark ? "text-amber-400/60" : "text-amber-600"}`}>Plateforme multi-pays</p></div>
        </div>
        {resolvedCountry && (
          <div className={`mx-3 mt-3 p-3 rounded-2xl border flex items-center gap-3 ${isDark ? "border-white/8 bg-white/3" : "border-slate-200 bg-slate-50"}`}>
            <Flag code={resolvedCountry.code} size={40} />
            <div><p className={`font-bold text-sm ${txt}`}>{resolvedCountry.name}</p><p className={`text-xs font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{resolvedCountry.phoneCode}</p></div>
          </div>
        )}
        <nav className="flex-1 p-3 space-y-1 mt-3">
          {([{key:"dashboard",icon:"🏠",label:"Accueil"},{key:"contacts",icon:"👥",label:"Mes contacts"},{key:"profile",icon:"⚙️",label:"Paramètres"}] as const).map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left border ${activeTab === tab.key ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : `border-transparent ${isDark ? "text-slate-400 hover:bg-white/5 hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}`}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className={`border-t p-3 ${isDark ? "border-white/5" : "border-slate-200"}`}>
          <button onClick={() => setIsDark(!isDark)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition border ${isDark ? "border-white/8 bg-white/3 text-slate-400 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900"}`}>
            <span>{isDark ? "🌙" : "☀️"}</span><span>{isDark ? "Mode sombre" : "Mode clair"}</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${isDark ? "bg-amber-400/20 text-amber-400" : "bg-slate-200 text-slate-500"}`}>ON</span>
          </button>
        </div>
        <div className={`border-t p-3 ${isDark ? "border-white/5" : "border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-sm font-black text-white flex-shrink-0">{user?.email?.[0]?.toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className={`text-xs font-semibold truncate ${txt}`}>{user?.email}</p><p className={`text-xs ${sub}`}>{resolvedCountry?.name}</p></div>
            <button onClick={logout} className={`text-sm flex-shrink-0 transition ${isDark ? "text-slate-600 hover:text-red-400" : "text-slate-400 hover:text-red-500"}`} title="Déconnexion">🚪</button>
          </div>
        </div>
      </aside>
      <main className="lg:ml-64 flex-1 p-4 sm:p-6 relative z-10 pt-16 lg:pt-6">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <p className={`text-xs uppercase tracking-widest ${sub}`}>{activeTab === "dashboard" ? "Vue d'ensemble" : activeTab === "contacts" ? "Mon réseau" : "Mon compte"}</p>
              <h1 className={`text-2xl font-black mt-0.5 ${txt}`}>{activeTab === "dashboard" ? "Accueil" : activeTab === "contacts" ? "Mes contacts" : "Paramètres"}</h1>
            </div>
            <div className={`text-sm rounded-xl px-3 py-2 border ${isDark ? "text-slate-400 bg-white/3 border-white/8" : "text-slate-500 bg-white border-slate-200"}`}>
              {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </header>
          {activeTab === "dashboard" ? renderDashboard() : activeTab === "contacts" ? <ContactsManager isDark={isDark} /> : renderProfile()}
        </div>
      </main>
    </div>
  );
}

export default App;
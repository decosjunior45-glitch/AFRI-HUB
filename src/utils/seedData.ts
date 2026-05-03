import { getDatabase } from "./db";

// ✅ Codes ISO 2 lettres — cohérents avec FLAG_MAP frontend
const countries = [
  // Afrique de l'Ouest
  { code: "sn", name: "Sénégal",              flag: "🇸🇳", phoneCode: "+221" },
  { code: "ci", name: "Côte d'Ivoire",         flag: "🇨🇮", phoneCode: "+225" },
  { code: "ml", name: "Mali",                  flag: "🇲🇱", phoneCode: "+223" },
  { code: "gh", name: "Ghana",                 flag: "🇬🇭", phoneCode: "+233" },
  { code: "ng", name: "Nigeria",               flag: "🇳🇬", phoneCode: "+234" },
  { code: "bj", name: "Bénin",                 flag: "🇧🇯", phoneCode: "+229" },
  { code: "bf", name: "Burkina Faso",          flag: "🇧🇫", phoneCode: "+226" },
  { code: "gn", name: "Guinée",                flag: "🇬🇳", phoneCode: "+224" },
  { code: "gw", name: "Guinée-Bissau",         flag: "🇬🇼", phoneCode: "+245" },
  { code: "cv", name: "Cap-Vert",              flag: "🇨🇻", phoneCode: "+238" },
  { code: "gm", name: "Gambie",                flag: "🇬🇲", phoneCode: "+220" },
  { code: "lr", name: "Libéria",               flag: "🇱🇷", phoneCode: "+231" },
  { code: "mr", name: "Mauritanie",            flag: "🇲🇷", phoneCode: "+222" },
  { code: "ne", name: "Niger",                 flag: "🇳🇪", phoneCode: "+227" },
  { code: "sl", name: "Sierra Leone",          flag: "🇸🇱", phoneCode: "+232" },
  { code: "tg", name: "Togo",                  flag: "🇹🇬", phoneCode: "+228" },
  // Afrique Centrale
  { code: "cm", name: "Cameroun",              flag: "🇨🇲", phoneCode: "+237" },
  { code: "cg", name: "Congo",                 flag: "🇨🇬", phoneCode: "+242" },
  { code: "cd", name: "DR Congo",              flag: "🇨🇩", phoneCode: "+243" },
  { code: "ga", name: "Gabon",                 flag: "🇬🇦", phoneCode: "+241" },
  { code: "td", name: "Tchad",                 flag: "🇹🇩", phoneCode: "+235" },
  { code: "cf", name: "Rép. Centrafricaine",   flag: "🇨🇫", phoneCode: "+236" },
  { code: "gq", name: "Guinée Équatoriale",    flag: "🇬🇶", phoneCode: "+240" },
  { code: "st", name: "São Tomé-et-Príncipe",  flag: "🇸🇹", phoneCode: "+239" },
  { code: "bi", name: "Burundi",               flag: "🇧🇮", phoneCode: "+257" },
  { code: "rw", name: "Rwanda",                flag: "🇷🇼", phoneCode: "+250" },
  // Afrique de l'Est
  { code: "ke", name: "Kenya",                 flag: "🇰🇪", phoneCode: "+254" },
  { code: "ug", name: "Ouganda",               flag: "🇺🇬", phoneCode: "+256" },
  { code: "tz", name: "Tanzanie",              flag: "🇹🇿", phoneCode: "+255" },
  { code: "et", name: "Éthiopie",              flag: "🇪🇹", phoneCode: "+251" },
  { code: "so", name: "Somalie",               flag: "🇸🇴", phoneCode: "+252" },
  { code: "dj", name: "Djibouti",              flag: "🇩🇯", phoneCode: "+253" },
  { code: "er", name: "Érythrée",              flag: "🇪🇷", phoneCode: "+291" },
  { code: "ss", name: "Soudan du Sud",         flag: "🇸🇸", phoneCode: "+211" },
  { code: "sd", name: "Soudan",                flag: "🇸🇩", phoneCode: "+249" },
  { code: "mg", name: "Madagascar",            flag: "🇲🇬", phoneCode: "+261" },
  { code: "mu", name: "Maurice",               flag: "🇲🇺", phoneCode: "+230" },
  { code: "sc", name: "Seychelles",            flag: "🇸🇨", phoneCode: "+248" },
  { code: "km", name: "Comores",               flag: "🇰🇲", phoneCode: "+269" },
  // Afrique Australe
  { code: "za", name: "Afrique du Sud",        flag: "🇿🇦", phoneCode: "+27"  },
  { code: "ao", name: "Angola",                flag: "🇦🇴", phoneCode: "+244" },
  { code: "zm", name: "Zambie",                flag: "🇿🇲", phoneCode: "+260" },
  { code: "zw", name: "Zimbabwe",              flag: "🇿🇼", phoneCode: "+263" },
  { code: "mz", name: "Mozambique",            flag: "🇲🇿", phoneCode: "+258" },
  { code: "mw", name: "Malawi",                flag: "🇲🇼", phoneCode: "+265" },
  { code: "bw", name: "Botswana",              flag: "🇧🇼", phoneCode: "+267" },
  { code: "na", name: "Namibie",               flag: "🇳🇦", phoneCode: "+264" },
  { code: "ls", name: "Lesotho",               flag: "🇱🇸", phoneCode: "+266" },
  { code: "sz", name: "Eswatini",              flag: "🇸🇿", phoneCode: "+268" },
  // Afrique du Nord
  { code: "ma", name: "Maroc",                 flag: "🇲🇦", phoneCode: "+212" },
  { code: "dz", name: "Algérie",               flag: "🇩🇿", phoneCode: "+213" },
  { code: "tn", name: "Tunisie",               flag: "🇹🇳", phoneCode: "+216" },
  { code: "ly", name: "Libye",                 flag: "🇱🇾", phoneCode: "+218" },
  { code: "eg", name: "Égypte",                flag: "🇪🇬", phoneCode: "+20"  },
];

export async function seedDatabase() {
  const db = await getDatabase();
  try {
    await db.collection("countries").deleteMany({});
    await db.collection("links").deleteMany({});
    console.log("🗑️  Collections nettoyées");
  } catch { console.log("Collections n'existaient pas encore"); }

  for (const country of countries) {
    await db.collection("countries").insertOne(country as any);
    console.log(`✅ ${country.flag} ${country.name} (${country.code.toUpperCase()})`);
  }
  console.log(`\n🌍 Seeding complet: ${countries.length} pays africains`);
}
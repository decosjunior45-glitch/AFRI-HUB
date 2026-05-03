import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { itemsRouter } from "./controllers/itemsController";
import { countriesRouter } from "./controllers/countriesController";
import { authRouter } from "./controllers/authController";
import announcementsRouter from "./controllers/announcementsController"; // ✅ NOUVEAU
import { errorHandler } from "./utils/errorHandler";
import { getDatabase } from "./utils/db";
import { seedDatabase } from "./utils/seedData";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Force UTF-8 encoding
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

app.use(express.json({ limit: '50mb' }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV || "development" });
});

app.get("/debug/countries", async (_req, res) => {
  try {
    const db = await getDatabase();
    const countries = await db.collection("countries").find().toArray();

    let html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body>
        <h1>Debug Countries</h1>
        <h2>En base de données:</h2>
    `;

    for (const c of countries) {
      html += `<p>Code: ${c.code} | Flag: "${c.flag}" | Name: ${c.name} | Phone: ${c.phoneCode}</p>`;
    }

    html += `
        <h2>JSON brut:</h2>
        <pre>${JSON.stringify(countries, null, 2)}</pre>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    res.json({ error: String(err) });
  }
});

app.post("/admin/fix-flags", async (_req, res) => {
  try {
    const db = await getDatabase();
    const flagMap: Record<string, string> = {
      "sn": "🇸🇳", "ci": "🇨🇮", "ml": "🇲🇱", "gh": "🇬🇭",
      "ng": "🇳🇬", "ke": "🇰🇪", "cm": "🇨🇲", "bj": "🇧🇯",
      "cg": "🇨🇬", "ug": "🇺🇬", "td": "🇹🇩", "cf": "🇨🇫",
      "ma": "🇲🇦", "dz": "🇩🇿", "tn": "🇹🇳", "ly": "🇱🇾",
      "eg": "🇪🇬", "za": "🇿🇦", "ng2": "🇳🇬", "et": "🇪🇹"
    };

    for (const [code, flag] of Object.entries(flagMap)) {
      await db.collection("countries").updateOne({ code }, { $set: { flag } });
    }

    res.json({ message: "Flags fixed", updated: Object.keys(flagMap).length });
  } catch (err) {
    res.json({ error: String(err) });
  }
});

app.get("/debug/flags", async (_req, res) => {
  try {
    const db = await getDatabase();
    const countries = await db.collection("countries").find().toArray();

    const flagData = countries.map((c: any) => ({
      code: c.code,
      flag: c.flag,
      flagCharCodes: [...(c.flag || "")].map((ch: string) => ch.charCodeAt(0)),
      flagHex: [...(c.flag || "")].map((ch: string) => "0x" + ch.charCodeAt(0).toString(16)).join(" ")
    }));

    res.json(flagData);
  } catch (err) {
    res.json({ error: String(err) });
  }
});

// ── Routes API ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/countries", countriesRouter);
app.use("/api/announcements", announcementsRouter); // ✅ NOUVEAU

app.use(errorHandler);

// ── Démarrage ────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await getDatabase();
    await seedDatabase();
    app.listen(port, () => {
      console.log(`AFRI-HUB backend is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to start server", error);
    process.exit(1);
  }
}

startServer();
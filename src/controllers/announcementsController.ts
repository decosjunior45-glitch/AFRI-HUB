import { Router } from "express";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { getDatabase } from "../utils/db";
import { getCountryCodeFromRequest } from "../utils/subdomain";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const ADMIN_EMAIL = "admin@afri-hub.com";

export type AnnouncementType = "emploi" | "evenement" | "service" | "vente";

// ── Auth ─────────────────────────────────────────────────────────────────────
function requireAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Connexion requise" });
  }
  try {
    const decoded = jwt.verify(auth.split(" ")[1], JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Session expirée" });
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────────
function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Réservé à l'administrateur AFRI-HUB" });
  }
  next();
}

// ── GET — lecture publique ────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const countryCode = getCountryCodeFromRequest(req) || (req.query.country as string);
    if (!countryCode) return res.status(400).json({ error: "Pays non détecté" });

    const db = await getDatabase();
    const announcements = await db.collection("announcements")
      .find({ countryCode, active: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(announcements.map((a: any) => ({ ...a, _id: a._id.toHexString() })));
  } catch (error) { next(error); }
});

// ── POST — admin seulement, avec image + PDF ──────────────────────────────────
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const countryCode = getCountryCodeFromRequest(req) || req.body.countryCode;
    if (!countryCode) return res.status(400).json({ error: "Pays non détecté" });

    const {
      title, description, type, contact, location, price, dateEvent,
      imageBase64, imageType,
      pdfBase64, pdfName,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ error: "Titre requis" });
    if (!description?.trim()) return res.status(400).json({ error: "Description requise" });
    if (!["emploi", "evenement", "service", "vente"].includes(type)) {
      return res.status(400).json({ error: "Type invalide" });
    }

    // ✅ Validation taille image (Base64 ~33% plus grand que binaire)
    if (imageBase64 && imageBase64.length > 4 * 1024 * 1024) {
      return res.status(400).json({ error: "Image trop grande (max 3 Mo)" });
    }
    if (pdfBase64 && pdfBase64.length > 7 * 1024 * 1024) {
      return res.status(400).json({ error: "PDF trop grand (max 5 Mo)" });
    }

    const announcement: any = {
      title: title.trim(),
      description: description.trim(),
      type,
      countryCode,
      authorEmail: req.user.email,
      contact: contact?.trim() || "",
      location: location?.trim() || "",
      price: price?.trim() || "",
      dateEvent: dateEvent || "",
      createdAt: new Date(),
      active: true,
    };

    // ✅ Ajouter image si présente
    if (imageBase64 && imageType) {
      announcement.imageBase64 = imageBase64;
      announcement.imageType = imageType;
    }

    // ✅ Ajouter PDF si présent
    if (pdfBase64 && pdfName) {
      announcement.pdfBase64 = pdfBase64;
      announcement.pdfName = pdfName;
    }

    const db = await getDatabase();
    const result = await db.collection("announcements").insertOne(announcement);
    res.status(201).json({ ...announcement, _id: result.insertedId.toHexString() });
  } catch (error) { next(error); }
});

// ── DELETE — admin seulement ──────────────────────────────────────────────────
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const db = await getDatabase();
    await db.collection("announcements").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { active: false } }
    );
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;
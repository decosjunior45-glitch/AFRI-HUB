import { Router } from "express";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDatabase } from "../utils/db";
import { getCountryCodeFromRequest } from "../utils/subdomain";
import { User, AuthResponse } from "../types/user";

interface MongoUser extends Omit<User, "_id"> {
  _id: ObjectId;
}

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ✅ Fonction robuste : essaie le subdomain d'abord, puis le body en fallback
function resolveCountryCode(req: any): string | null {
  // 1. Essai via sous-domaine (production + local correct)
  const fromSubdomain = getCountryCodeFromRequest(req);
  if (fromSubdomain) return fromSubdomain;

  // 2. Fallback : le frontend envoie countryCode dans le body
  if (req.body?.countryCode && typeof req.body.countryCode === "string") {
    return req.body.countryCode.toLowerCase();
  }

  // 3. Fallback : header personnalisé x-country-code
  const fromHeader = req.headers["x-country-code"];
  if (fromHeader && typeof fromHeader === "string") {
    return fromHeader.toLowerCase();
  }

  return null;
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const countryCode = resolveCountryCode(req);

    if (!countryCode) {
      return res.status(400).json({ 
        error: "Pays non détecté. Assurez-vous d'accéder via senegal.localhost:5173" 
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe sont requis" });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Le mot de passe doit faire au moins 4 caractères" });
    }

    const db = await getDatabase();
    const existingUser = await db.collection<MongoUser>("users").findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: Omit<MongoUser, "_id"> = {
      email,
      password: hashedPassword,
      countryCode,
      createdAt: new Date()
    };

    const result = await db.collection<MongoUser>("users").insertOne(newUser as MongoUser);

    const token = jwt.sign(
      { userId: result.insertedId.toHexString(), email, countryCode },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response: AuthResponse = {
      token,
      user: {
        _id: result.insertedId.toHexString(),
        email,
        countryCode
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const countryCode = resolveCountryCode(req);

    if (!countryCode) {
      return res.status(400).json({ 
        error: "Pays non détecté. Assurez-vous d'accéder via senegal.localhost:5173" 
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe sont requis" });
    }

    const db = await getDatabase();
    const user = await db.collection<MongoUser>("users").findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    // ✅ Vérification souple : on accepte si même pays OU si l'user n'a pas de pays assigné
    if (user.countryCode && user.countryCode !== countryCode) {
      return res.status(403).json({ 
        error: `Ce compte appartient à un autre pays. Connectez-vous depuis ${user.countryCode}.localhost:5173` 
      });
    }

    const token = jwt.sign(
      { userId: user._id.toHexString(), email: user.email, countryCode: user.countryCode || countryCode },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response: AuthResponse = {
      token,
      user: {
        _id: user._id.toHexString(),
        email: user.email,
        countryCode: user.countryCode || countryCode
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../utils/db";
import { getCountryCodeFromRequest } from "../utils/subdomain";
import { Country, Link } from "../types/country";

// Mapping des codes vers les emojis
const flagMap: Record<string, string> = {
  "senegal": "🇸🇳",
  "cotedivoire": "🇨🇮",
  "mali": "🇲🇱",
  "ghana": "🇬🇭",
  "nigeria": "🇳🇬",
  "kenya": "🇰🇪",
  "cameroon": "🇨🇲",
  "benin": "🇧🇯",
  "congo": "🇨🇬",
  "uganda": "🇺🇬"
};

interface MongoCountry extends Omit<Country, "_id"> {
  _id: ObjectId;
}

interface MongoLink extends Omit<Link, "_id"> {
  _id: ObjectId;
}

function serializeCountry(country: MongoCountry): Country {
  return {
    _id: country._id.toHexString(),
    code: country.code,
    name: country.name,
    flag: flagMap[country.code] || country.flag || "🌍",
    phoneCode: country.phoneCode
  };
}

function serializeLink(link: MongoLink): Link {
  return {
    _id: link._id.toHexString(),
    countryCode: link.countryCode,
    title: link.title,
    url: link.url,
    description: link.description
  };
}

export const countriesRouter = Router();

countriesRouter.get("/", async (_req, res, next) => {
  try {
    const db = await getDatabase();
    const countries = await db.collection<MongoCountry>("countries").find().toArray();
    res.json(countries.map(serializeCountry));
  } catch (error) {
    next(error);
  }
});

countriesRouter.get("/current", async (req, res, next) => {
  try {
    const code = getCountryCodeFromRequest(req);
    if (!code) {
      return res.status(400).json({ error: "Impossible de détecter le pays à partir du sous-domaine." });
    }

    const db = await getDatabase();
    const country = await db.collection<MongoCountry>("countries").findOne({ code });

    if (!country) {
      return res.status(404).json({ error: `Pays introuvable pour le code '${code}'.` });
    }

    res.json(serializeCountry(country));
  } catch (error) {
    next(error);
  }
});

countriesRouter.get("/current/links", async (req, res, next) => {
  try {
    const code = getCountryCodeFromRequest(req);
    if (!code) {
      return res.status(400).json({ error: "Impossible de détecter le pays à partir du sous-domaine." });
    }

    const db = await getDatabase();
    const links = await db.collection<MongoLink>("links").find({ countryCode: code }).toArray();

    res.json(links.map(serializeLink));
  } catch (error) {
    next(error);
  }
});

countriesRouter.get("/:code", async (req, res, next) => {
  try {
    const code = req.params.code.toLowerCase();
    const db = await getDatabase();
    const country = await db.collection<MongoCountry>("countries").findOne({ code });

    if (!country) {
      return res.status(404).json({ error: `Pays introuvable pour le code '${code}'.` });
    }

    res.json(serializeCountry(country));
  } catch (error) {
    next(error);
  }
});

countriesRouter.get("/:code/links", async (req, res, next) => {
  try {
    const code = req.params.code.toLowerCase();
    const db = await getDatabase();
    const country = await db.collection<MongoCountry>("countries").findOne({ code });

    if (!country) {
      return res.status(404).json({ error: `Pays introuvable pour le code '${code}'.` });
    }

    const links = await db.collection<MongoLink>("links").find({ countryCode: code }).toArray();
    res.json(links.map(serializeLink));
  } catch (error) {
    next(error);
  }
});

countriesRouter.post("/", async (req, res, next) => {
  try {
    const { code, name, flag, phoneCode } = req.body;

    if (!code || !name || !flag || !phoneCode) {
      return res.status(400).json({ error: "Les champs code, name, flag et phoneCode sont requis." });
    }

    const db = await getDatabase();

    // Vérifier si le pays existe déjà
    const existingCountry = await db.collection<MongoCountry>("countries").findOne({ code: code.toLowerCase() });
    if (existingCountry) {
      return res.status(409).json({ error: `Le pays avec le code '${code}' existe déjà.` });
    }

    const newCountry: Omit<MongoCountry, "_id"> = {
      code: code.toLowerCase(),
      name,
      flag,
      phoneCode
    };

    const result = await db.collection<MongoCountry>("countries").insertOne(newCountry);
    const insertedCountry = await db.collection<MongoCountry>("countries").findOne({ _id: result.insertedId });

    if (!insertedCountry) {
      throw new Error("Erreur lors de la récupération du pays inséré.");
    }

    res.status(201).json(serializeCountry(insertedCountry));
  } catch (error) {
    next(error);
  }
});

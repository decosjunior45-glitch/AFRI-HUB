import { Request } from "express";

export function getCountryCodeFromRequest(req: Request): string | null {
  const hostHeader = req.headers["x-forwarded-host"] || req.headers.host || req.hostname;
  const host = typeof hostHeader === "string" ? hostHeader.split(":")[0].toLowerCase() : "";

  // Détecter les sous-domaines (ex: senegal.localhost, mali.localhost)
  const subdomainMatch = host.match(/^([a-z0-9-]+)\.localhost$/i);
  if (subdomainMatch) {
    return subdomainMatch[1].toLowerCase();
  }

  // Pour localhost direct (développement), retourner null pour permettre une valeur par défaut
  if (host === "localhost") {
    return null;
  }

  // Pour les environnements de production, essayer de détecter d'autres patterns
  const prodMatch = host.match(/^([a-z0-9-]+)\.afri-hub\.com$/i);
  if (prodMatch) {
    return prodMatch[1].toLowerCase();
  }

  return null;
}

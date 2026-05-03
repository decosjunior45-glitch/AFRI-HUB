# AFRI-HUB

Plateforme Multi-Pays Pour Services En Afrique.

## Démarrage local

1. Installer les dépendances backend et frontend :
   ```bash
   npm install
   npm --prefix client install
   ```

2. Lancer le backend :
   ```bash
   npm run dev
   ```

3. Lancer le frontend :
   ```bash
   cd client
   npm run dev
   ```

## Docker

```bash
docker compose up --build
```

Le frontend sera disponible sur `http://localhost:5173` et l’API backend sur `http://localhost:4000`.

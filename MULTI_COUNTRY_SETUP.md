# Configuration Multi-Pays AFRI-HUB

## 🌍 Architecture

L'application fonctionne maintenant avec une **page d'accueil centrale** qui permet aux utilisateurs de sélectionner leur pays, puis les **redirige vers un sous-domaine dédié**.

### Flux utilisateur

```
1. Utilisateur arrive sur : http://afri-hub.localhost:5173
                               ↓
2. Page affiche tous les pays disponibles (carte moderne)
                               ↓
3. Clic sur "Sénégal"
                               ↓
4. Redirection vers : http://senegal.localhost:5173
                               ↓
5. Détection du sous-domaine "senegal"
                               ↓
6. Chargement interface avec données du Sénégal (isolées)
```

## 🚀 Pour tester en local

### 1️⃣ Configurer les sous-domaines dans `hosts`

Ouvrez `C:\Windows\System32\drivers\etc\hosts` en administrateur et ajoutez :

```
127.0.0.1 afri-hub.localhost
127.0.0.1 senegal.localhost
127.0.0.1 cotedivoire.localhost
127.0.0.1 mali.localhost
127.0.0.1 ghana.localhost
127.0.0.1 nigeria.localhost
127.0.0.1 kenya.localhost
127.0.0.1 cameroon.localhost
127.0.0.1 benin.localhost
127.0.0.1 congo.localhost
127.0.0.1 uganda.localhost
```

### 2️⃣ Démarrer les serveurs

**Terminal 1 (Backend)** :
```bash
cd c:\Users\USER\projects\AFRI-HUB
npm run dev
# Port 4000
```

**Terminal 2 (Frontend)** :
```bash
cd c:\Users\USER\projects\AFRI-HUB\client
npm run dev
# Port 5173
```

### 3️⃣ Tester le flux complet

1. **Page d'accueil** : `http://afri-hub.localhost:5173`
   - Affiche 2 cartes : Sénégal 🇸🇳 (+221) et Côte d'Ivoire 🇨🇮 (+225)
   - Clic sur une carte = redirection automatique

2. **Espace Sénégal** : `http://senegal.localhost:5173`
   - Backend détecte le sous-domaine "senegal"
   - Login/Register isolé par pays
   - Items stockés uniquement pour le Sénégal

3. **Espace Côte d'Ivoire** : `http://cotedivoire.localhost:5173`
   - Même logique mais isolé pour le pays

## 📊 Base de données

### Structure Country (backend)

```typescript
{
  code: "senegal",        // Code long (utilisé en sous-domaine)
  name: "Sénégal",        // Nom affiché
  flag: "🇸🇳",           // Emoji drapeau
  phoneCode: "+221"       // Code téléphonique
}
```

### Données actuelles

- **Sénégal** : code=`senegal`, phoneCode=`+221`
- **Côte d'Ivoire** : code=`cotedivoire`, phoneCode=`+225`
- **Mali** : code=`mali`, phoneCode=`+223`
- **Ghana** : code=`ghana`, phoneCode=`+233`
- **Nigeria** : code=`nigeria`, phoneCode=`+234`
- **Kenya** : code=`kenya`, phoneCode=`+254`
- **Cameroun** : code=`cameroon`, phoneCode=`+237`
- **Bénin** : code=`benin`, phoneCode=`+229`
- **Congo** : code=`congo`, phoneCode=`+242`
- **Ouganda** : code=`uganda`, phoneCode=`+256`

## 🔧 Ajouter un nouveau pays

### 1️⃣ Mettre à jour `src/utils/seedData.ts`

```typescript
const countries: Country[] = [
  { code: "senegal", name: "Sénégal", flag: "🇸🇳", phoneCode: "+221" },
  { code: "cotedivoire", name: "Côte d'Ivoire", flag: "🇨🇮", phoneCode: "+225" },
  { code: "mali", name: "Mali", flag: "🇲🇱", phoneCode: "+223" }  // ← NOUVEAU
];
```

### 2️⃣ Ajouter au fichier `hosts`

```
127.0.0.1 mali.localhost
```

### 3️⃣ Redémarrer l'app

```bash
# Backend va recréer les données via seedDatabase()
npm run dev
```

### 4️⃣ Tester

- Page d'accueil affiche Mali 🇲🇱
- Clic = redirection vers `http://mali.localhost:5173`

## 🎨 Logique de redirection

Quand l'utilisateur clique sur un pays depuis la page d'accueil :

```typescript
const redirectToCountry = (selectedCountry: Country) => {
  const port = window.location.port ? `:${window.location.port}` : "";
  const baseDomain = hostname.endsWith(".localhost") ? "localhost" : hostname;
  window.location.href = `${window.location.protocol}//${selectedCountry.code}.${baseDomain}${port}`;
};
```

- Récupère le port (5173)
- Crée l'URL : `http://senegal.localhost:5173`
- Redirection automatique

## 🔐 Isolation par pays

### Backend (Express)

**Détection du pays via sous-domaine** :
```typescript
// getCountryCodeFromRequest(req)
const subdomainMatch = host.match(/^([a-z0-9-]+)\.localhost$/i);
// "senegal.localhost" → "senegal"
```

**Filtrage des items** :
```typescript
// Tous les items filtrés par userId ET countryCode
items.find({ userId: req.userId, countryCode: req.countryCode })
```

### Frontend (React)

**Détection du host** :
```typescript
const isRootHost = hostname === 'afri-hub.localhost' || ...;
```

- `true` → Page sélection pays
- `false` → App complète du pays

## 🌐 Production

Pour la production, remplacez `.localhost` par votre domaine :

- Domaine racine : `afri-hub.com`
- Sénégal : `senegal.afri-hub.com`
- Côte d'Ivoire : `cotedivoire.afri-hub.com`

**Pas de changement de code requis** : l'app détecte automatiquement !

## 🐛 Debugging

### Vérifier le host détecté

Ouvrez la console du navigateur :

```javascript
console.log(window.location.hostname);
// "senegal.localhost"
```

### Appels API pour déboguer

```bash
# Récupérer tous les pays
curl http://localhost:4000/api/countries

# Récupérer le pays actuel (depuis senegal.localhost)
curl http://localhost:4000/api/countries/current
```

## ✅ Checklist de test

- [ ] Page d'accueil affiche tous les pays
- [ ] Clic sur une carte = redirection vers sous-domaine
- [ ] Authentification fonctionne isolée par pays
- [ ] Items d'un pays ≠ items d'un autre pays
- [ ] Le drapeau et code téléphonique s'affichent
- [ ] Logout/login permet de changer de pays

---

## 🎨 Design moderne AFRI-HUB

### Logo stylisé
- Cercle dégradé `emerald → amber`
- Initiales "AH" en blanc
- Shadow moderne
- Cohérent avec palette africaine

### Couleurs
- **Primaire** : Emerald (vert africain)
- **Secondaire** : Amber (jaune/or)
- **Accent** : Slate (neutre professionnel)
- **Erreurs** : Rose

### Composants
- Cartes hover avec animations
- Gradients subtils emerald/amber
- Recherche de pays intégrée
- Design responsive (mobile → desktop)
- Shadow moderne et professionnel

### Caractéristiques UX
- Page d'accueil avec 10 pays
- Recherche par nom/code/numéro
- Affichage drapeau + code pays
- Design SaaS moderne et épuré
- Transitions fluides

---

## 🐛 Debugging

### Vérifier le host détecté

Ouvrez la console du navigateur :

```javascript
console.log(window.location.hostname);
// "senegal.localhost"
```

### Appels API pour déboguer

```bash
# Récupérer tous les pays
curl http://localhost:4000/api/countries

# Récupérer le pays actuel (depuis senegal.localhost)
curl http://localhost:4000/api/countries/current
```

---

**Problème ?** Vérifiez :
1. ✅ Fichier `hosts` configuré avec tous les 10 pays
2. ✅ Backend tourne sur port 4000
3. ✅ Frontend tourne sur port 5173
4. ✅ Base de données MongoDB démarrée
5. ✅ Seed data chargée (10 pays visibles via GET /countries)

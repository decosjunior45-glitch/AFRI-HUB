# Architecture Authentification JWT - AFRI-HUB

## 📊 Vue d'ensemble

```
Utilisateur 
    ↓
[Login/Register] → POST /api/auth/login ou /api/auth/register
    ↓
JWT Token créé → stocké en localStorage
    ↓
Chaque requête API envoie: Authorization: Bearer <token>
    ↓
authMiddleware vérifie signature + expiration
    ↓
Request enrichi avec: req.user = { userId, email, countryCode }
    ↓
Routes métier filtrent par userId + countryCode
```

---

## 🔐 Backend (Express + TypeScript)

### 1. Types (`src/types/user.ts`)
```typescript
interface User {
  email: string;
  password: string; // hashée avec bcryptjs
  countryCode: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  countryCode: string;
}
```

### 2. Middleware (`src/middleware/authMiddleware.ts`)
- Extrait le JWT du header `Authorization: Bearer <token>`
- Vérifie la signature avec `JWT_SECRET`
- Attache les données utilisateur à `req.user`
- Rejette les requêtes sans token valide

### 3. Contrôleur Auth (`src/controllers/authController.ts`)

**POST /api/auth/register**
```
Body: { email, password }
- Détecte le pays via sous-domaine
- Hash le password avec bcryptjs
- Crée l'utilisateur en DB
- Retourne JWT + user
```

**POST /api/auth/login**
```
Body: { email, password }
- Cherche l'user par email
- Vérifie le password (bcrypt.compare)
- Valide que l'user belong au pays du sous-domaine
- Retourne JWT + user
```

### 4. Routes sécurisées
Toutes les routes items utilisent `authMiddleware`:
```
GET  /api/items          → filtre par userId + countryCode
POST /api/items          → crée avec userId + countryCode auto
PUT  /api/items/:id      → met à jour si userId + countryCode match
DELETE /api/items/:id    → supprime si userId + countryCode match
```

### 5. Variables d'environnement (`.env`)
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
```

---

## 🎨 Frontend (React + TypeScript)

### 1. AuthContext (`client/src/contexts/AuthContext.tsx`)
- État global: `user`, `token`, `isAuthenticated`
- Méthodes: `login()`, `register()`, `logout()`
- Stockage: JWT + user en localStorage
- Hook: `useAuth()` pour accéder partout

### 2. Composant Auth (`client/src/components/AuthForm.tsx`)
- Écran Login/Register avec toggle
- Gestion d'erreurs
- Integration avec AuthContext

### 3. App.tsx
- Protège: affiche AuthForm si non authentifié
- Envoie JWT dans chaque requête: `Authorization: Bearer ${token}`
- Affiche l'email + pays de l'utilisateur en haut
- Bouton déconnexion

### 4. ItemManager.tsx
- Reçoit `token` en props
- Envoie JWT dans tous les appels fetch

### 5. main.tsx
- Enveloppe l'app avec `<AuthProvider>`

---

## 🔄 Flux utilisateur

1. **Première visite** → AuthForm (login/register)
2. **S'inscrire** → POST /api/auth/register → JWT retourné
3. **Se connecter** → POST /api/auth/login → JWT retourné
4. **JWT stocké** → localStorage
5. **Rechargement page** → AuthContext lit JWT de localStorage
6. **Requête items** → envoie JWT dans Authorization header
7. **Backend** → vérifie JWT, filtre par userId + countryCode
8. **Déconnexion** → supprime JWT de localStorage

---

## 🛡️ Sécurité

✅ Passwords hashées avec bcryptjs (salt 10)
✅ JWT signés avec secret en env
✅ Middleware valide chaque route
✅ Utilisateurs isolés par userId
✅ Isolation par pays (countryCode)
✅ Expiration JWT 7 jours
✅ Tokens en localStorage (XSS risk mitigated avec Content-Security-Policy en production)

---

## 📦 Dépendances ajoutées

Backend:
- `bcryptjs` - hachage de passwords
- `jsonwebtoken` - création/vérification JWT

Frontend:
- Aucune nouvelle (React+Vite suffisent)

---

## ✅ Checklist complète

- [x] Types User + JWT
- [x] Middleware authMiddleware
- [x] Contrôleur register/login
- [x] Routes protégées avec authMiddleware
- [x] AuthContext (global state)
- [x] Composant AuthForm (UI)
- [x] App.tsx protection + affichage user
- [x] ItemManager envoi JWT
- [x] main.tsx wrapping
- [x] .env variables JWT
- [x] npm install dépendances
- [x] Backend compile (npm run build)

---

## 🚀 Prochaines étapes

1. Tester avec: `npm run dev` (backend) + `npm run dev` (client)
2. Tester register sur senegal.localhost:5173
3. Tester login et création d'items
4. Tester isolation par pays
5. Ajouter refresh tokens (optionnel)
6. Ajouter 2FA (optionnel)

# Architecture technique

## Vue d'ensemble

```
 Téléphone (app Android, Capacitor)            PC (Node.js, server.js)
 ┌──────────────────────────────┐   Wi-Fi     ┌──────────────────────────────┐
 │ index.html (même page)       │  HTTP/JSON  │ /api/...  (auth, synchro)    │
 │ données: localStorage        │ ──────────▶ │ data.json, donnees/*.json    │
 │ origine https://localhost    │ ◀────────── │ users.json, sessions.json    │
 └──────────────────────────────┘             │ sert index.html au navigateur│
                                              └──────────────────────────────┘
```

Toute l'application est **une seule page** (`index.html` : HTML, CSS et JavaScript sans framework).
Elle tourne de deux façons :

- **web** : servie par `server.js`, elle lit et écrit via l'API (`IS_SERVER = true`) ;
- **Android** : embarquée dans l'APK par Capacitor, elle lit et écrit dans le `localStorage` du
  téléphone (`IS_NATIVE = true`) et se synchronise avec l'API du PC.

## Fichiers du projet

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | L'application (source de vérité ; copiée dans `www/` au build) |
| `server.js` | Serveur HTTP : fichiers publics, connexion, API de données, synchro, utilisateurs, repères |
| `sync.js` | Fusion des données entre appareils (voir [synchronisation](synchronisation.md)) |
| `scripts/build-apk.js` | `npm run apk` : copie page + données dans `www/`, sync Capacitor, build Gradle |
| `www/` | Copie de la page embarquée dans l'APK (générée, ne pas modifier à la main) |
| `android/` | Projet Android Capacitor (icônes, écran de démarrage, `BlessedMoney.apk`) |
| `capacitor.config.json` | appId `com.blessed.portemonnaie.dev`, nom « Blessed Money », `allowMixedContent` |
| `manifest.json`, `sw.js`, `icon.svg` | Application web installable (PWA) |
| `DancingScript.ttf` | Police du logo, embarquée pour s'afficher hors ligne |
| `data.json` | Données du compte principal |
| `donnees/<utilisateur>.json` | Données des autres comptes |
| `users.json`, `sessions.json` | Comptes (mots de passe hachés) et sessions ouvertes |
| `reference.json` | Repères anonymes publiés par l'admin |
| `www/accounts.json` | (généré) comptes embarqués dans l'APK : `{mode: "perso" \| "testeurs", accounts: [{username, role, primary, offline}]}` |
| `www/pc.json` | (généré, APK perso uniquement) adresse du PC sur le Wi-Fi |
| `apk/` | (généré) `BlessedMoney-testeurs.apk` |
| `backups/` | Copies de sécurité |
| `demarrage.md` | Aide-mémoire des commandes |
| `PorteMonnaieApp/` | Ancienne copie du projet (historique, non utilisée) |

## Format des données

```json
{
  "sorties": [
    { "id": 1, "uid": "44d98b086e5ad431", "maj": 1790328326122,
      "date": "2026-09-25", "description": "Sandwich", "montant": 2000, "source": "Wallet" }
  ],
  "entrees": [
    { "id": 1, "uid": "…", "maj": 0,
      "date": "2026-09-24", "source": "Mum", "montant": 10000, "destinataire": "Wallet" }
  ],
  "soldesInitiaux": { "Chambre": 0, "Wallet": -4000, "Mvola": -33, "Airtel": 4025 },
  "plan": {
    "revenus":   { "2026-10": 277000 },
    "budgets":   { "2026-10": { "Repas": 18500 } },
    "objectifs": [ { "id": 1, "nom": "Bottes", "montant": 100000, "debut": "2026-10", "fin": "2026-10" } ],
    "activites": [ { "id": 2, "date": "2026-10-04", "nom": "Resto", "montant": 5000, "cat": "Repas" } ]
  },
  "majSoldes": 0,
  "majPlan": 0,
  "supprimes": [ { "uid": "…", "at": 1790328326122 } ]
}
```

- Sources : `Wallet` (porte-feuille), `Chambre`, `Mvola`, `Airtel`. Montants en ariary (entiers).
- Solde d'une source = solde initial + entrées vers cette source − sorties depuis cette source.
- Sur le téléphone, clé `localStorage` : `porteMonnaie:v2026-08-03` pour le compte principal
  (l'ancienne clé `porteMonnaie` est relue si besoin), `porteMonnaie:v2026-08-03:<utilisateur>` pour les autres.

## API du serveur

Toutes les routes sauf `/api/login` exigent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Rôle |
|---|---|---|
| POST | `/api/login` | `{username, password}` → `{token, username, role, primary}` |
| GET | `/api/me` | Utilisateur de la session |
| POST | `/api/logout` | Ferme la session |
| POST | `/api/account` | `{currentPassword, newUsername?, newPassword?}` : modifier son compte |
| GET | `/api/load` | Données de l'utilisateur |
| POST | `/api/save` | Envoie l'état complet ; le serveur fusionne et renvoie `{data, stats}`. `?source=phone` garde une copie dans `backups/` |
| GET | `/api/reference` | Repères partagés |
| POST | `/api/reference` | (admin) Publie les repères |
| GET | `/api/users` | (admin) Liste des comptes |
| POST | `/api/users` | (admin) `{username, password}` : créer un compte |
| POST | `/api/users/<nom>/password` | (admin) `{password}` : donner un nouveau mot de passe |
| DELETE | `/api/users/<nom>` | (admin) Supprimer un compte et ses données (copie dans `backups/`) |

Seuls `index.html`, `manifest.json`, `sw.js`, `icon.svg` et `DancingScript.ttf` sont servis
publiquement ; aucun fichier de données n'est accessible sans connexion.

## Comptes

- `users.json` : `username`, `role` (`admin` / `user`), `primary` (compte principal → `data.json`),
  `dataId` (nom du fichier dans `donnees/`, stable même après renommage), `salt` + `hash` (scrypt).
- Au premier démarrage, le serveur crée `blessed` / `blessed` (admin, principal).
- `offline` : empreinte **PBKDF2-SHA256** (150 000 itérations, sel aléatoire) créée avec le mot de
  passe (création, nouveau mot de passe, changement, ou prochaine connexion pour les anciens comptes).
  Elle est embarquée dans l'APK et vérifiée par l'app avec la WebCrypto du téléphone.
- Connexion sur le téléphone : d'abord **hors ligne** (comptes embarqués, puis comptes déjà connus
  `porteMonnaie:comptes`) ; si le PC répond, une session est récupérée en arrière-plan pour la synchro.
  Le PC n'est interrogé en premier que pour un compte inconnu de l'appareil.
- `blessed/blessed` par défaut n'existe que si l'APK n'embarque pas déjà le compte principal, et jamais
  dans l'APK des testeurs.

## Logique des analyses (dans `index.html`)

### Catégories

Chaque dépense est classée d'après sa description (mots-clés, première catégorie qui correspond) :

| Catégorie | Type |
|---|---|
| Argent perdu (Very) | fuite |
| Église & dons | essentiel |
| Livraison (achat en ligne) | plaisir |
| Taxi moto / Indrive | plaisir |
| Transport quotidien | essentiel |
| Vêtements & accessoires | plaisir |
| Beauté & hygiène | essentiel |
| Téléphone & abonnements | essentiel |
| Frais Mobile Money | fuite |
| Sport & loisirs | plaisir |
| Cadeaux & proches | plaisir |
| Études, papiers & auto-école | essentiel |
| Repas | essentiel |
| Grignotage & boissons | plaisir |
| Maison & divers | essentiel (tout le reste) |

Pour ajouter un mot-clé : tableau `CATEGORIES` dans `index.html`.

### Fonctions principales

| Fonction | Rôle |
|---|---|
| `renderAnalyse()` | Page Analyse : chiffres clés, conseils, catégories, évolution, grosses dépenses |
| `getHistory(mois)` | Moyennes mensuelles des 3 mois précédents (ou repères si peu de données) |
| `computePlanState(mois)` | Budgets, objectifs, réel, activités et argent libre d'un mois |
| `renderPlan()` | Page Planifier |
| `impulseWarning()` | Alerte « achat impulsif » avant d'ajouter une dépense ou une activité |
| `detectHabits()` | Alertes d'habitudes (3 dernières semaines / 30 jours vs historique) |
| `buildSuggestIndex()` / `attachAutocomplete()` | Autocomplétion (fréquence, récence, jour de la semaine) |
| `buildReference()` / `syncReference()` | Repères anonymes pour les nouveaux utilisateurs |
| `syncWithPC()` / `pushAndMerge()` | Synchro du téléphone |

## Android

- Capacitor 8, `androidScheme: https` (l'app tourne sur `https://localhost`) ; `allowMixedContent` et
  `usesCleartextTraffic` permettent d'appeler le serveur du PC en HTTP sur le Wi-Fi.
- `windowSoftInputMode="adjustResize"` : l'écran rétrécit quand le clavier s'ouvre.
- Icônes « BM » roses (`mipmap-*`), écran de démarrage « Blessed Money » (`drawable*/splash.png`).
- Le nom du fichier généré est fixé dans `android/app/build.gradle` (`BlessedMoney.apk`).

# Données, sauvegardes et sécurité

## Où sont les données

| Endroit | Contenu |
|---|---|
| Téléphone (`localStorage` de l'app) | Les données du compte connecté, disponibles hors ligne |
| PC : `data.json` | Données du compte principal (blessed) |
| PC : `donnees/<utilisateur>.json` | Données des autres comptes |
| PC : `backups/` | Copies de sécurité (voir ci-dessous) |
| APK : `www/data.json` | Instantané des données du compte principal au moment du `npm run apk` (sert seulement à une installation neuve) |

## Sauvegardes

Le dossier `backups/` contient :

- `phone-<utilisateur>-<date>.json` : ce que le téléphone a envoyé lors d'une synchro manuelle ;
- `data-avant-recup-2026-09-25.json` : l'ancien `data.json` avant la récupération des données ;
- `recup-sorties-telephone-2026-09-25.json` et `porte-monnaie-complet-2026-09-25.json` : les données
  récupérées depuis l'écran du téléphone le 25/09/2026 (1 029 dépenses = 2 686 700 Ar, 132 revenus =
  2 733 800 Ar, vérifiées à l'ariary près).

Pour restaurer : sur le site web, **Opérations → Importer** et choisir un de ces fichiers (il est
fusionné avec les données actuelles).

Conseil : copier régulièrement `data.json` sur une clé USB ou un cloud personnel.

## Comptes et mots de passe

- Les mots de passe sont stockés **hachés** (scrypt + sel) dans `users.json`, jamais en clair.
- Les sessions (`sessions.json`) survivent au redémarrage du serveur : le téléphone reste connecté.
- Changer le mot de passe par défaut `blessed` dans **Mon compte**.
- Mot de passe oublié : arrêter le serveur, supprimer `users.json`, relancer → le compte redevient
  `blessed` / `blessed` (les données dans `data.json` et `donnees/` ne sont pas touchées, mais les
  autres comptes sont à recréer).

## Ce qui est accessible sur le réseau

- Le serveur écoute sur le Wi-Fi local (port 3000). Sans connexion, seuls la page et ses fichiers
  (icône, police, manifest) sont accessibles ; `data.json`, `users.json`, `backups/`… ne sont jamais servis.
- La communication téléphone ↔ PC est en HTTP simple : à utiliser sur un Wi-Fi de confiance (maison),
  pas sur un Wi-Fi public.

## Ce qui est partagé avec les autres utilisateurs

Les **repères** (`reference.json`), publiés automatiquement quand l'admin se connecte sur le web :

- budget moyen par catégorie (3 derniers mois) ;
- prix habituels des articles courants (achetés au moins 3 fois) ;
- prix des activités types (resto, piscine, Indrive…).

Exclus : tous les revenus, la catégorie « Cadeaux & proches » (prénoms), l'argent perdu, les montants
individuels. La catégorie « Église & dons » (dîme, offrandes, chorale) est incluse ; pour l'exclure,
l'ajouter à `PRIVATE_CATEGORIES` dans `index.html`.

## Git

`users.json`, `sessions.json`, `reference.json`, `donnees/`, `backups/` et les APK sont exclus de git
(`.gitignore`). **`data.json` et `www/data.json` sont suivis par git** : si le dépôt est un jour publié
(GitHub public…), il faut d'abord les retirer, car ils contiennent toutes les dépenses et revenus.

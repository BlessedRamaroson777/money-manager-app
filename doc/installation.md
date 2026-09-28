# Installation et démarrage

## Prérequis

- **Node.js** (testé avec la v22) — `npm install` à la racine installe Capacitor.
- **Android Studio** (pour le SDK Android et son JDK `C:\Program Files\Android\Android Studio\jbr`,
  utilisé automatiquement par `npm run apk`).
- Le téléphone et le PC sur le **même Wi-Fi** pour la synchronisation.

## Lancer le site web et le serveur

```
npm start
```

Le terminal affiche :

```
Blessed Money - Serveur Démarré!
📍 Ouvre: http://localhost:3000
📱 Depuis le téléphone: http://192.168.1.x:3000
🔑 Connexion par défaut: blessed / blessed
```

- Sur le PC : ouvrir http://localhost:3000.
- L'adresse « Depuis le téléphone » est celle à donner à l'app Android pour la synchro.
- Au premier démarrage, Windows demande d'autoriser Node : **autoriser sur les réseaux privés**,
  sinon le téléphone ne peut pas joindre le PC.
- Après une mise à jour de `server.js`, il faut **arrêter (Ctrl+C) et relancer** `npm start` :
  un ancien serveur resté ouvert ne connaît pas les nouvelles fonctions.

Le port peut être changé : `PORT=3001 npm start` (ou `$env:PORT=3001; npm start` sous PowerShell).

## Générer l'app Android

```
npm run apk
```

Le script [`scripts/build-apk.js`](../scripts/build-apk.js) :

1. copie la page (`index.html`, `manifest.json`, `sw.js`, `icon.svg`, `DancingScript.ttf`) dans `www/` ;
2. copie les **données à jour** du compte principal (`data.json`) et **l'adresse du PC sur le Wi-Fi**
   (`pc.json`) dans l'APK : même après une installation neuve, le téléphone sait où trouver le PC ;
3. lance `npx cap sync android` puis `gradlew assembleDebug`.

Résultat : `android/app/build/outputs/apk/debug/BlessedMoney.apk`.

> Les données embarquées ne servent qu'au **tout premier lancement** d'une installation neuve.
> Ensuite l'app garde ses propres données et se synchronise avec le PC.

## APK pour les testeurs (sans PC)

```
npm run apk:testeurs
```

Génère `apk/BlessedMoney-testeurs.apk`, à envoyer aux testeurs, même très loin : l'app fonctionne
**sans jamais joindre le PC**.

- Embarque : la page, les **comptes créés sur le site web** (sous forme d'empreinte PBKDF2, jamais le
  mot de passe) et les **repères**.
- N'embarque pas : tes données, l'adresse du PC, le compte admin / principal (et `blessed/blessed`
  ne marche pas dans cet APK).
- Chaque testeur se connecte hors ligne ; ses données restent **sur son téléphone** (tu ne les vois pas).

Étapes :
1. Site web → **Utilisateurs** : créer un compte par testeur (ou **Nouveau mot de passe** pour un
   compte créé avant cette fonction : il lui faut une empreinte hors ligne, le script le signale).
2. `npm run apk:testeurs`.
3. Envoyer `apk/BlessedMoney-testeurs.apk` + ses identifiants à chaque testeur.

Un compte créé ou un mot de passe changé **après** la génération n'est connu qu'avec un nouvel APK.

## Installer l'APK sur le téléphone

- Copier `BlessedMoney.apk` sur le téléphone et l'ouvrir (autoriser l'installation depuis cette source).
- **Toujours installer par-dessus l'app existante, sans la désinstaller** : désinstaller efface les
  données locales du téléphone (elles se récupèrent par la synchro, mais il faut se reconnecter).
- Le nom de l'app est « Blessed Money », identifiant Android `com.blessed.portemonnaie.dev`.

## Première synchronisation du téléphone

1. PC : `npm start`.
2. Téléphone : ouvrir l'app, se connecter.
3. Appuyer sur **Synchroniser** (en haut), saisir l'adresse affichée par `npm start`
   (ex. `http://192.168.1.3:3000`) puis le mot de passe du compte.

Ensuite tout est automatique : à l'ouverture, quelques secondes après chaque modification, et au
retour dans l'app. Voir [synchronisation](synchronisation.md).

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm start` | Serveur web + synchro |
| `npm run apk` | Génère `BlessedMoney.apk` avec les données à jour |
| `npx cap sync android` | Copie seulement `www/` dans le projet Android |
| `android\gradlew.bat assembleDebug` | Compile seulement l'APK |

# Blessed Money — documentation

Blessed Money est une application de gestion d'argent personnel : on y note chaque dépense et chaque
revenu, et l'app en tire des analyses (où va l'argent, habitudes qui s'emballent, ce dont on a vraiment
besoin) et aide à planifier le mois et à atteindre des objectifs d'épargne.

Elle existe en deux versions qui partagent les mêmes données :

- **l'app Android** (`BlessedMoney.apk`), utilisée au quotidien sur le téléphone, fonctionne hors ligne ;
- **le site web** servi par le PC (`npm start`, puis http://localhost:3000), pour consulter et gérer
  depuis l'ordinateur, et pour administrer les comptes utilisateurs.

Le téléphone et le PC se synchronisent automatiquement dès qu'ils sont sur le même Wi-Fi.

## Sommaire

| Document | Pour qui | Contenu |
|---|---|---|
| [Guide d'utilisation](utilisation.md) | Utilisatrice | Les pages de l'app, noter une dépense, analyses, planification, objectifs, comptes |
| [Installation et démarrage](installation.md) | Utilisatrice / développeur | Lancer le serveur, générer et installer l'APK, première synchro |
| [Synchronisation](synchronisation.md) | Utilisatrice / développeur | Comment le téléphone et le PC restent d'accord, sans doublons |
| [Architecture technique](architecture.md) | Développeur | Fichiers du projet, format des données, API du serveur, logique des analyses |
| [Données, sauvegardes et sécurité](donnees-et-securite.md) | Utilisatrice / développeur | Où sont les données, sauvegardes, comptes, ce qui est partagé |
| [Dépannage](depannage.md) | Utilisatrice | Les problèmes déjà rencontrés et leur solution |

## En bref

```
npm start        # démarre le site web + le serveur de synchro (http://localhost:3000)
npm run apk      # génère BlessedMoney.apk avec les données à jour du PC
```

Connexion par défaut : `blessed` / `blessed` (à changer dans « Mon compte »).

# Dépannage

## « Serveur injoignable » ou « Le serveur n'est pas à jour » sur le site web

Un ancien `npm start` tourne encore avec l'ancien code. Dans son terminal : **Ctrl+C**, puis
`npm start`. La bannière doit afficher « Blessed Money - Serveur Démarré! ».

## Le téléphone n'arrive pas à se synchroniser

1. Le PC a bien `npm start` qui tourne ?
2. Même Wi-Fi pour les deux ?
3. L'adresse est celle affichée par `npm start` (« Depuis le téléphone : http://192.168.1.x:3000 ») ?
   L'adresse du PC peut changer après un redémarrage de la box : appuyer sur **Synchroniser** et
   corriger l'adresse (en cas d'échec, l'app redemande l'adresse et le mot de passe).
4. Pare-feu Windows : autoriser **Node.js** sur les réseaux privés
   (Paramètres → Pare-feu → Autoriser une application).
5. Test rapide : ouvrir l'adresse dans le navigateur du téléphone ; la page de connexion doit s'afficher.

## Le téléphone affiche d'anciennes données après l'installation d'un APK

L'app a été désinstallée (ou ses données effacées) : elle repart de l'instantané contenu dans l'APK.
Se connecter avec le PC allumé : la synchro ramène tout. Pour la suite, toujours installer **par-dessus**,
et générer l'APK avec `npm run apk` (qui embarque les données à jour).

## « Compte inconnu sur ce téléphone et PC injoignable »

Le compte a été créé sur le web et le téléphone ne peut le vérifier qu'auprès du PC. Vérifier que
`npm start` tourne, que le téléphone est sur le même Wi-Fi, et que le champ **Adresse du PC** de l'écran
de connexion correspond à l'adresse affichée par `npm start` (elle peut changer après un redémarrage de
la box). Après une première connexion réussie, le compte marche aussi hors ligne.

## Mot de passe oublié

Voir [données et sécurité](donnees-et-securite.md#comptes-et-mots-de-passe).

## Une dépense apparaît en double après une synchro

Cas rare : une ancienne opération modifiée sur un appareil pas encore synchronisé. Supprimer le doublon ;
la suppression est ensuite propagée partout.

## L'app met du temps à démarrer sur le téléphone

Le logo « Blessed Money » s'affiche pendant le chargement. Les polices Google sont chargées sans bloquer
l'affichage et le logo utilise une police embarquée : l'app démarre même sans internet.

## Le clavier cache le champ ou le bouton

Pendant la saisie, la barre de navigation du bas se cache et le champ remonte en haut de l'écran, les
suggestions juste en dessous. Si ça arrive encore sur un écran précis, le signaler avec une capture.

## Historique des problèmes résolus

| Problème | Cause | Solution |
|---|---|---|
| L'export ne faisait rien sur Android | Les téléchargements et le partage de fichiers ne marchent pas dans la WebView | Synchro directe avec le PC via le Wi-Fi |
| « localhost » inaccessible depuis le téléphone | Sur le téléphone, localhost = le téléphone | Utiliser l'adresse IP du PC |
| Données de février introuvables | L'app avait changé d'identifiant et de clé de stockage | Récupération depuis l'écran du téléphone, relecture de l'ancienne clé |
| Accents cassés (« GoÃƒÂ»ter ») | Double encodage d'anciennes données | Corrigés lors de la récupération |
| N'importe qui sur le Wi-Fi pouvait lire `data.json` | Le serveur servait tous les fichiers | Liste blanche de fichiers publics + connexion obligatoire |

# Guide d'utilisation

## Connexion

Au démarrage, le logo « Blessed Money » s'écrit pendant le chargement, puis l'écran de connexion
s'affiche. Le compte par défaut est `blessed` / `blessed`. Tant que ce mot de passe est utilisé, un
rappel apparaît sur l'accueil avec un bouton **Changer**.

Chaque utilisateur a son propre porte-monnaie : les données d'un compte ne sont jamais visibles par un autre.

## Les pages

La navigation est en haut sur ordinateur, en bas de l'écran sur téléphone (elle se cache pendant la
saisie pour ne pas masquer le clavier).

| Page | Contenu |
|---|---|
| **Accueil** | Vérification « Compte OK » (entrées − sorties = somme des soldes), soldes par compte, alertes d'habitudes, boutons rapides **+ Dépense** / **+ Revenu** |
| **Opérations** | Formulaires de dépense et de revenu, listes avec recherche et tri, modification / suppression |
| **Analyse** | Statistiques par jour / semaine / mois, puis l'analyse détaillée des dépenses |
| **Planifier** | Prévision du mois, objectifs, calendrier des activités, budget par catégorie |
| **Utilisateurs** | (site web, admin uniquement) création et suppression des comptes |

En haut à droite : le nom du compte (ouvre **Mon compte**), **Déconnexion**, et sur le téléphone le
bouton **Synchroniser**.

## Les comptes d'argent

Quatre « sources » : **Porte-feuille** (Wallet), **Argent Chambre**, **Mvola**, **Airtel Money**.
Chaque dépense sort d'une source, chaque revenu arrive dans une source. Le bouton **Modifier** d'une
carte de solde ajuste le solde initial (utile pour recaler l'app sur la réalité).

## Noter une dépense ou un revenu

1. Page **Opérations** (ou **+ Dépense** sur l'accueil).
2. Tape le début de la description : l'app propose tes dépenses habituelles avec leur prix
   (ex. « frais » → Frais de livraison · 4 000 Ar, Frais retrait · 500 Ar…). Choisir une suggestion
   remplit aussi le montant et la source habituels.
3. Champ vide : l'app propose ce que tu achètes d'habitude ce jour de la semaine.
4. **Ajouter**.

Si la dépense est un « plaisir » (vêtements, snacks, taxi, sorties…) et qu'elle menace un objectif ou
dépasse nettement le budget, l'app demande confirmation et explique pourquoi (achat impulsif, prix bien
plus cher que d'habitude, objectif pas encore financé…). Les dépenses du quotidien (bus, repas, église)
ne déclenchent jamais d'alerte.

## Analyse

Choisir la période (3 derniers mois, depuis le début, ou un mois précis). L'app affiche :

- **4 chiffres clés** : dépensé, moyenne par mois, essentiel par mois, plaisir par mois ;
- **Ce qu'il faut retenir** : achats en ligne et frais de livraison, taxi / Indrive comparé au bus,
  grignotage comparé aux repas, fuites (argent perdu « Very », frais de retrait), revenus − dépenses,
  et ce dont tu as vraiment besoin par mois ;
- **Où va mon argent** : une barre par catégorie ;
- **Évolution par mois** et **grosses dépenses** (20 000 Ar et plus).

Les catégories sont devinées à partir de la description (voir [architecture](architecture.md#catégories)).

### Alertes d'habitudes

Sur l'accueil, au plus 3 alertes discrètes quand une habitude change : un article acheté bien plus
souvent que d'habitude sur les 3 dernières semaines (« Nouvelle habitude : Coca cola 7× en 3 semaines »),
ou une catégorie plaisir qui s'emballe sur 30 jours. Le **×** masque une alerte pour la semaine.

## Planifier le mois

Par défaut, le mois prochain (jusqu'à 5 mois à l'avance).

- **Revenu prévu** et **budget par catégorie** : estimés sur tes 3 derniers mois, modifiables.
  **Revenir à l'estimation** annule tes modifications.
- **Objectifs** : ex. « Bottes, 100 000 Ar, pour octobre ». L'app calcule s'il manque de l'argent et
  propose des sacrifices chiffrés (plus de commande en ligne, bus au lieu d'Indrive, moins de snacks…).
  **Appliquer ces sacrifices au budget** les reporte dans le budget. Si ça ne suffit pas, elle indique
  le revenu à trouver ou le nombre de mois nécessaires.
- **Calendrier des activités** : clique un jour, choisis une activité type (prix tirés de ton
  historique : resto, piscine, Indrive…) ou saisis la tienne. Chaque activité reçoit un verdict :
  dans le budget, possible sur l'argent libre, ou pas dans le budget (avec le montant qui manque).

## Nouveaux utilisateurs : les repères

Un compte qui a encore peu de données (moins de 30 dépenses ou moins d'un mois) profite des
**repères** : budget typique par catégorie et prix habituels, calculés à partir des données du compte
principal (moyennes anonymes, sans noms ni revenus). Ils servent pour l'analyse (« Repères pour bien
démarrer »), le budget du mois, les activités types et l'autocomplétion. Dès qu'il y a assez de données
personnelles, l'app bascule sur celles-ci.

## Mon compte

Clique sur ton nom en haut : tu peux changer ton **nom d'utilisateur** et/ou ton **mot de passe**
(le mot de passe actuel est demandé). Tes données suivent le changement de nom. Depuis le téléphone,
le PC doit être joignable.

## Gérer les utilisateurs (site web, admin)

Page **Utilisateurs** : un nom et un mot de passe sont générés (le bouton à côté de chaque champ en
génère d'autres), et restent modifiables.
**Créer l'utilisateur** affiche les identifiants à transmettre avec un bouton **Copier**. On peut
supprimer un compte (ses données restent sur le PC, dans `donnees/`). Le compte principal ne peut pas
être supprimé.

Un utilisateur créé sur le web doit se connecter une première fois sur le téléphone avec le PC allumé ;
ensuite la connexion marche aussi hors ligne.

## Différences téléphone / web

| | App Android | Site web |
|---|---|---|
| Hors ligne | Oui | Non (le PC doit tourner) |
| Synchroniser | Automatique + bouton en haut | Automatique (enregistre directement sur le PC) |
| Importer / Exporter / Effacer | Masqués (trop risqué) | Disponibles en bas de **Opérations** |
| Utilisateurs | — | Page admin |

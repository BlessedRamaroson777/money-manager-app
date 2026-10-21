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

Par défaut : **Porte-feuille**, **Argent Chambre**, **Mvola**, **Airtel Money**. On peut en ajouter
autant qu'on veut (Épargne, Banque, Orange Money…) avec la carte **Ajouter un compte** de l'accueil ou
dans **Réglages** (icône engrenage en haut) : renommer, changer le type (espèces, mobile money, banque,
épargne), masquer, ou supprimer un compte qui n'a jamais servi.

Chaque dépense sort d'un compte, chaque revenu arrive sur un compte. Sur une carte, saisir le **solde
réel** puis **Modifier** recale le compte sur la réalité (l'app ajuste son solde de départ).

## Transferts entre comptes

**Opérations → Transferts** : déplacer de l'argent d'un compte à l'autre (ex. Chambre → Mvola).
Ce n'est ni une dépense ni un revenu : les totaux et les analyses ne changent pas, seuls les soldes
des deux comptes bougent. Les **frais** éventuels (retrait Mvola…) sont enregistrés comme une vraie
dépense sur le compte de départ.

## Dettes

**Opérations → Dettes** : « J'ai emprunté » (je dois) ou « J'ai prêté » (on me doit), avec la personne,
le montant, le compte par lequel l'argent est passé (ou « aucun compte » pour un achat à crédit), et une
date pour rendre (en rouge si elle est dépassée). **Je rembourse / On me rembourse** enregistre un
remboursement partiel ou total. Un emprunt n'est pas un revenu et un remboursement n'est pas une
dépense : ils bougent seulement le solde du compte. Un rappel « je dois / on me doit » s'affiche sur l'accueil.

## Journal et situation à une date

**Opérations → Journal** (ou « Voir ma situation à une date » sur l'accueil) : tout ce qui s'est passé
sur un **jour**, une **semaine**, un **mois** ou une **période** au choix, avec les flèches ‹ › pour
passer à la période précédente / suivante. Pour la période : reçu, dépensé, bilan, les catégories où
l'argent est parti, puis les opérations regroupées **par jour** (et **par semaine** sur un mois), avec
les totaux. La carte **Ma situation le … au soir** donne l'argent qu'il y avait sur chaque compte à la
fin de la période (disponible et épargne séparés).

## Noter une dépense ou un revenu

1. Page **Opérations** (ou **+ Dépense** sur l'accueil).
2. Tape le début de la description : l'app propose tes dépenses habituelles avec leur prix
   habituel (le montant qui revient le plus souvent, sinon le prix médian) ou ton **prix de base**
   s'il est défini dans **Réglages → Prix de base** (ex. Indrive 6 000 Ar)
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

### Analyse des revenus

Même période que l'analyse des dépenses : total reçu, moyenne par mois, plus gros versement, part de
chaque personne (« D'où vient mon argent »), rythme des versements (« Mum : environ tous les 4 jours »),
dépendance à une ou deux personnes, et reçu / dépensé / reste mois par mois.

### Où est passé cet argent ?

Pour chaque revenu : combien a déjà été dépensé, avec quoi, et ce qu'il en reste. Sur l'accueil :
« L'argent qui te reste vient de : Mum …, Aunty … ». Deux façons de compter, au choix :

- **le dernier argent reçu paie les dépenses suivantes** (par défaut) : après un versement de Mum,
  les dépenses sont payées avec l'argent de Mum ;
- **l'argent le plus ancien est utilisé d'abord**.

C'est un calcul global (tous comptes confondus) ; les transferts n'y changent rien.

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
**Créer l'utilisateur** affiche les identifiants à transmettre avec un bouton **Copier**.

Pour chaque compte :

- **Nouveau mot de passe** : les mots de passe sont chiffrés de façon irréversible, on ne peut donc pas
  voir celui d'un utilisateur. L'admin en donne un nouveau (généré, modifiable), affiché avec **Copier**.
  L'ancien ne marche plus et les sessions ouvertes avec lui sont fermées.
- **Supprimer** : supprime le compte **et ses données** (une dernière copie est gardée dans
  `backups/supprime-<nom>-<date>.json` sur le PC). Le compte principal ne peut pas être supprimé.

Un utilisateur créé sur le web se connecte sur le téléphone avec le PC allumé : l'écran de connexion de
l'app contient le champ **Adresse du PC** (déjà rempli avec l'adresse mise dans l'APK). Après cette
première connexion, ça marche aussi hors ligne.

## Bouton retour (téléphone)

Le bouton retour d'Android ferme d'abord la fenêtre ouverte (modifier, mon compte…), puis revient à la
page précédente, puis à l'accueil ; depuis l'accueil, l'app passe en arrière-plan.

## Différences téléphone / web

| | App Android | Site web |
|---|---|---|
| Hors ligne | Oui | Non (le PC doit tourner) |
| Synchroniser | Automatique + bouton en haut | Automatique (enregistre directement sur le PC) |
| Importer / Exporter / Effacer | Masqués (trop risqué) | Disponibles en bas de **Opérations** |
| Utilisateurs | — | Page admin |

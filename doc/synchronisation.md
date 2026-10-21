# Synchronisation téléphone ↔ PC

## Le principe

Le **PC fait foi** : il garde un fichier de données par utilisateur. Chaque appareil (l'app Android,
le site web) envoie **tout son état** au PC ; le PC le **fusionne** avec ce qu'il a déjà et renvoie le
résultat commun, que l'appareil adopte. Personne n'écrase personne.

- **Téléphone** : synchro à l'ouverture de l'app, 4 secondes après chaque modification, au retour dans
  l'app, et avec le bouton **Synchroniser** (qui affiche combien d'opérations ont été reçues / envoyées).
  Hors ligne, l'app fonctionne normalement et rattrape plus tard.
- **Site web** : chaque modification est envoyée au PC et fusionnée ; en revenant sur l'onglet, la page
  recharge ce que le téléphone a envoyé entre-temps.

## Les règles de fusion ([`sync.js`](../sync.js))

Chaque dépense / revenu porte :

- `uid` : un identifiant unique et stable (créé à l'ajout) ;
- `maj` : la date de dernière modification (millisecondes).

| Situation | Résultat |
|---|---|
| Même `uid` des deux côtés | La version avec le `maj` le plus récent gagne |
| Opération sans `uid` (données d'avant la synchro) | Reconnue par son **contenu** (date + description + montant + source), une pour une : pas de doublon |
| Opération nouvelle (uid inconnu) | Ajoutée, même si une opération identique existe (deux vrais trajets en bus le même jour restent deux) |
| Opération supprimée | Mémorisée dans `supprimes` (uid + date) pour ne pas revenir à la synchro suivante |
| Transferts, dettes | Mêmes règles que les dépenses (uid, `maj`, suppressions mémorisées) ; un remboursement met à jour le `maj` de sa dette |
| Soldes initiaux, planification, réglages (comptes, prix de base) | La version modifiée en dernier (`majSoldes`, `majPlan`, `majReglages`) gagne ; à égalité, celle du PC |

Les `id` (utilisés par l'interface pour modifier / supprimer) sont rendus uniques après fusion.
Les suppressions mémorisées sont limitées aux 5 000 plus récentes.

## Ce qui est testé

- Téléphone avec l'ancien instantané (1 029 dépenses, 47 000 Ar) + PC à jour (1 030, 45 000 Ar)
  → après connexion, le téléphone affiche 45 000 Ar sans action.
- Ajout sur le téléphone → arrive sur le PC tout seul, sans doublon.
- Modification sur un appareil, suppression sur l'autre, puis un appareil qui renvoie un vieil état
  → la modification est conservée et la suppression n'est pas annulée.

## Sauvegardes liées à la synchro

Une synchro **manuelle** depuis le téléphone (bouton) garde une copie de ce que le téléphone a envoyé
dans `backups/phone-<utilisateur>-<date>.json`. Les synchros automatiques n'en créent pas (elles sont
trop fréquentes).

## Limites connues

- Une opération **modifiée** sur un appareil qui ne s'était encore jamais synchronisé (sans `uid`)
  peut apparaître en double : son contenu ne correspond plus à celui du PC. Il suffit d'en supprimer une.
- Les changements faits sur le site web n'apparaissent sur un onglet déjà ouvert qu'au retour sur
  l'onglet (ou au rechargement).

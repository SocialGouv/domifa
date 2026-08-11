# Pagination et recherche serveur de la liste des usagers

## Pourquoi

La liste `manage-usagers` charge aujourd'hui **tous** les usagers d'une structure, puis
filtre, cherche et trie dans le navigateur. Le backend n'expose qu'un chargement massif ;
tout le reste vit dans `packages/frontend/src/app/modules/manage-usagers/services/usager-filter/`.

Conséquences : une requête dont le coût croît avec la structure, un thread Node mono-thread
qui s'en trouve saturé (incident du 11/08), et une empreinte mémoire navigateur proportionnelle
au stock de dossiers.

La PR #4243 a supprimé la part la plus lourde de la charge utile (la colonne `historique`,
jetée à la réception par tous les consommateurs) : coût par usager désormais constant plutôt
que croissant, gain mesuré de 2,4× à 23,7× selon l'ancienneté des dossiers. C'est un facteur
constant, pas une borne. La pagination serveur est la réponse durable.

## Périmètre

Déplacer côté serveur, dans un seul endpoint paginé :

| | aujourd'hui | à porter |
|---|---|---|
| filtres | `usagersFilter.service.ts` + 4 checkers | `statut`, `echeance`, `interactionType`, `lastInteractionDate`, `entretien`, `referrerId` |
| recherche texte | `usagersSearchStringFilter.service.ts` | `DEFAULT`, `BIRTH_DATE`, `PHONE_NUMBER` |
| tri | `usagersSorter.service.ts` | `NOM`, `PASSAGE`, `ECHEANCE`, `RDV`, `ID` × asc/desc |
| pagination | tranche locale | `page` + taille de page |

Une bonne part du SQL existe déjà : `searchInRadies` implémente `echeance`, `entretien`,
`referrerId`, `lastInteractionDate` et les trois modes de recherche, mais uniquement sur les
radiés et sans tri ni pagination. Le chantier consiste largement à **généraliser cet endpoint
à tous les statuts**, puis à supprimer les services de filtrage client.

## Les trois décisions à trancher avant d'écrire le code

### 1. La recherche par ayant droit disparaît si on ne fait rien

`nom_prenom_surnom_ref` (colonne dénormalisée, indexée, alimentée par `UsagerSubscriber`)
contient uniquement `nom + prenom + surnom + customRef|ref`.

Or la recherche client (`getAttributes`) parcourt **en plus** :
- le nom et le prénom de chaque **ayant droit**,
- le nom et le prénom de chaque **procuration**.

Chercher un dossier par le nom d'un enfant ou d'un mandataire fonctionne aujourd'hui. Une
bascule naïve sur `nom_prenom_surnom_ref` le casse **en silence**.

Options :
- **a.** étendre la colonne dénormalisée aux ayants droit et procurations (modification du
  subscriber + migration de rattrapage sur l'existant). L'index B-tree qu'elle portait est
  SUPPRIMÉ par la migration : il ne peut pas servir un `ILIKE '%…%'`, et son plafond de
  2704 octets par tuple (après compression) rendait un dossier à la fratrie nombreuse
  définitivement non modifiable. Ne pas le recréer.
- **b.** index GIN trigram sur une expression couvrant les colonnes JSONB. Plus souple,
  plus coûteux à maintenir.
- **c.** assumer la perte. À n'envisager que si l'usage est confirmé inexistant.

Recommandation : **a**. C'est la seule qui préserve le comportement à coût constant.

### 2. La recherche multi-mots n'a pas la même sémantique

Le client utilise `buildWords` + `search.match` : les mots saisis sont normalisés et doivent
**tous** être présents, dans n'importe quel ordre. « dupont marie » trouve nom=Dupont,
prénom=Marie.

`searchInRadies` fait aujourd'hui un `ILIKE '%<saisie>%'` sur la chaîne jointe : « dupont marie »
ne matche que si les deux mots sont contigus et dans cet ordre. Reproduire fidèlement demande
de découper la saisie et d'ANDer un `ILIKE` par mot.

À trancher : fidélité stricte (un `ILIKE` par mot) ou bascule assumée vers de la recherche
plein-texte Postgres. Recommandation : fidélité stricte d'abord, le plein-texte est un autre
sujet.

### 3. Le tri par échéance et par référence repose sur du calcul applicatif

- `ECHEANCE` trie sur `decisionDeadline.dateToDisplay`, produit par `getDecisionDeadline()`
  dans `@domifa/common` — donc absent de la base.
- `ID` trie sur `customRef` avec une règle naturelle maison : numériques d'abord et comparés
  comme des nombres, puis `localeCompare`.
- Les tris ont des départages (`nom`, `prenom`, `ref`, `surnom`) comparés en JS avec
  `localeCompare`, dont Postgres ne reproduira pas exactement l'ordre selon la collation.

À trancher : porter ces règles en SQL (et accepter des écarts d'ordre en bordure), ou
matérialiser les valeurs dérivées en colonnes. Recommandation : porter en SQL, en couvrant
les cas par des tests, et documenter les écarts de collation comme assumés.

## Découpage proposé

1. **Socle backend** — DTO de recherche paginée, endpoint `POST /search-usagers/search`,
   filtres et tri en SQL, réponse `{ usagers, total, page, pageSize }`. Tests unitaires sur la
   construction de requête, tests d'intégration sur un Postgres réel.
2. **Recherche fidèle** — décisions 1 et 2 : extension de la colonne dénormalisée + migration
   de rattrapage, découpage multi-mots.
3. **Bascule frontend** — le store ne détient plus qu'une page ; `filters$` déclenche un appel
   serveur ; suppression de `usagersFilter`, `usagersSorter`, `usagersSearchStringFilter` et des
   checkers, avec leurs specs.
4. **Nettoyage** — retrait de `chargerTousRadies`, de `update-manage` et de `search-radies`,
   devenus sans objet.

Les étapes 1 et 2 sont livrables indépendamment : tant que le frontend n'a pas basculé,
l'endpoint coexiste avec l'existant.

## Points de vigilance

- `usagersCountByStatus` (`/search-usagers/count`) alimente les onglets de statut et doit rester
  cohérent avec le total paginé.
- Le rafraîchissement automatique (`update-manage`, toutes les 5 minutes par onglet) n'a plus de
  sens page par page : à repenser en même temps, pas après.
- Les compteurs incrémentaux du store (`usager-actions-reducer.service.ts`) supposent que la
  liste locale est exhaustive. Ils devront disparaître avec la bascule.

# Tests différentiels des filtres usagers

Ces tests comparent deux implémentations d'une **même** règle métier :

- celle du navigateur (`packages/frontend/.../usager-filter/`), importée telle
  quelle et non réécrite, qui est le comportement que les utilisateurs
  constatent aujourd'hui ;
- sa traduction SQL (`applyUsagerCriteriaFilters`, `applyUsagerNameSearch`),
  qui la remplacera quand la liste passera en pagination serveur.

Les deux doivent désigner exactement les mêmes dossiers. C'est le seul moyen de
démontrer « aucune régression » sur une bascule de filtrage, plutôt que de
l'affirmer.

Le jeu de données place chaque usager sur une **frontière** : la veille et le
jour même d'une échéance, un champ absent, un rendez-vous daté d'aujourd'hui, un
référent nul. Deux implémentations d'une même règle ne divergent jamais au
milieu d'un intervalle.

## Lancer la suite

Elle a besoin d'une base Postgres dédiée, elle est donc exclue de `pnpm test`.

```sh
docker run -d --name domifa-diff-pg \
  -e POSTGRES_DB=domifa_diff -e POSTGRES_USER=domifa -e POSTGRES_PASSWORD=diffpwd \
  -e TZ=Europe/Paris -p 55432:5432 postgis/postgis:16-3.5

pnpm --filter @domifa/backend test:differential
```

## Fuseaux

Le fuseau du **process** joue le rôle du navigateur de l'agent, et la suite le
passe au SQL comme l'endpoint passera `structure.timeZone`. Chaque lancement
éprouve donc un appariement :

```sh
TZ=Europe/Paris   pnpm --filter @domifa/backend test:differential  # défaut
TZ=Pacific/Noumea pnpm --filter @domifa/backend test:differential  # ultramarin
```

Un fuseau hors de la liste du produit — dont UTC — échoue explicitement, au
chargement du module. Conséquence assumée : en CI, la suite dépend de l'étape
« Change TimeZone » du job — si le runner reste en `Etc/UTC`, l'échec précède
tout test et le dit clairement.

Le fuseau de **session PostgreSQL** est forcé à UTC, délibérément hostile :
l'application ne le fixe jamais, le SQL ne doit donc dépendre que de ses
`AT TIME ZONE` explicites. Les fixtures sensibles posent leurs instants à
22h30 UTC, là où jour local et jour UTC diffèrent — des dates à la même heure
murale que « maintenant » seraient invariantes par fuseau, et le jeu serait
structurellement aveugle à une confusion de fuseau.

Le typage de la suite n'est pas vérifié par `tsc` : elle importe des fichiers
du paquet frontend, qui portent des erreurs de types préexistantes sans rapport
avec elle. Le lint typé la couvre, via `tsconfig.differential.json`.

L'URL est surchargeable par `DIFFERENTIAL_DATABASE_URL`. La suite crée et
remplit sa propre table `usager` à chaque exécution : elle ne touche à aucune
base applicative.

## Ce que la suite a déjà attrapé

Deux divergences **préexistantes** entre `search-radies` et le navigateur, que
la bascule aurait reconduites en silence :

- l'échéance était filtrée sur `decision->>'dateDecision'` côté serveur, alors
  que le navigateur teste `decision.dateFin` ;
- le filtre « dernier passage » était **inversé** : le serveur gardait les
  dossiers revus depuis l'échéance, le navigateur ceux qui ne l'ont pas été.

Remettre l'une ou l'autre de ces sémantiques fait échouer la suite — vérifié.
C'est ce qui la rend utile : elle ne se contente pas de passer au vert sur le
code tel qu'il est écrit.

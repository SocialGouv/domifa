# Analyse de l'usage des ayants droit (Metabase)

> Objectif : avoir une photo précise de l'usage des ayants droit **avant** de
> construire la gestion des familles. Le chiffre le plus attendu est le
> **nombre / part de dossiers ayant un conjoint déclaré en ayant droit**.

## Périmètre

- Table `usager` uniquement, **tous les dossiers** (actifs, radiés, refus,
  instruction… aucun filtre sur `statut`).
- `usager_history_states` est **exclu** de l'analyse.
- Toute comparaison entre personnes (retrouver le conjoint dans un autre
  dossier) est hors périmètre : traitée dans le ticket suivant via un script,
  car la base Metabase est anonymisée.

## Ce que la base anonymisée permet (greenmask)

| Donnée | État dans Metabase | Exploitable ? |
|---|---|---|
| `ayantsDroits[].lien` | conservé tel quel (`CONJOINT`, `ENFANT`, `PARENT`, `AUTRE`) | ✅ |
| `ayantsDroits[].dateNaissance` | tronquée au 1er du mois (année + mois conservés) | ✅ pour l'âge / « majeur » |
| `ayantsDroits[].nom` / `prenom` | fake | ❌ (comparaison de personnes) |
| `usager.dateNaissance` | tronquée au 1er du mois | ✅ |
| `usager_entretien.typeMenage` | conservé tel quel | ✅ |
| `structure.nom` | conservé | ✅ (Top 20 lisibles) |

Les ayants droit sont stockés dans une colonne **JSONB** `usager."ayantsDroits"`
(tableau d'objets `{ nom, prenom, dateNaissance, lien }`). Pour éviter de
requêter du JSON partout, on crée d'abord **deux modèles Metabase**
([doc](https://www.metabase.com/docs/latest/data-modeling/models)) qui exposent
ces données comme de vraies tables.

---

## Modèle A — `ayants_droit_deplies`

Une ligne par ayant droit. Sert aux répartitions par lien et aux Top structures.

```sql
SELECT
  u.uuid                                     AS usager_uuid,
  u.ref                                      AS usager_ref,
  u."structureId"                            AS structure_id,
  u.statut                                   AS usager_statut,
  ad.value->>'lien'                          AS lien,
  NULLIF(ad.value->>'dateNaissance', '')::timestamptz AS date_naissance,
  CASE
    WHEN NULLIF(ad.value->>'dateNaissance', '') IS NOT NULL
    THEN date_part('year', age((ad.value->>'dateNaissance')::timestamptz))::int
  END                                        AS age,
  CASE
    WHEN ad.value->>'lien' = 'ENFANT'
     AND NULLIF(ad.value->>'dateNaissance', '') IS NOT NULL
     AND date_part('year', age((ad.value->>'dateNaissance')::timestamptz)) >= 18
    THEN true ELSE false
  END                                        AS est_enfant_majeur
FROM usager u
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
       THEN u."ayantsDroits" ELSE '[]'::jsonb END
) AS ad(value);
```

## Modèle B — `dossiers_avec_ayants_droit`

Une ligne par **dossier** (tous les dossiers, y compris ceux à 0 ayant droit),
avec les compteurs pré-agrégés et le `typeMenage` de l'entretien. C'est le
modèle qui rend triviales la distribution et la cohérence avec l'entretien.

```sql
SELECT
  u.uuid                AS usager_uuid,
  u.ref                 AS usager_ref,
  u."structureId"       AS structure_id,
  u.statut              AS usager_statut,
  e."typeMenage"        AS type_menage,
  COALESCE(jsonb_array_length(
    CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
         THEN u."ayantsDroits" END), 0)               AS nb_ayants_droits,
  (SELECT count(*) FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
           THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
   WHERE x->>'lien' = 'CONJOINT')                      AS nb_conjoints,
  (SELECT count(*) FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
           THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
   WHERE x->>'lien' = 'ENFANT')                        AS nb_enfants,
  (SELECT count(*) FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
           THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
   WHERE x->>'lien' = 'ENFANT'
     AND NULLIF(x->>'dateNaissance', '') IS NOT NULL
     AND date_part('year', age((x->>'dateNaissance')::timestamptz)) >= 18)
                                                       AS nb_enfants_majeurs,
  (SELECT count(*) FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
           THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
   WHERE x->>'lien' = 'PARENT')                        AS nb_parents,
  (SELECT count(*) FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
           THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
   WHERE x->>'lien' = 'AUTRE')                         AS nb_autres
FROM usager u
LEFT JOIN usager_entretien e ON e."usagerUUID" = u.uuid;
```

> **Note montage Metabase** : chaque requête ci-dessous est **autonome**
> (elle recrée le dépliage en CTE). Une fois les modèles A/B sauvegardés,
> tu peux remplacer la CTE par `FROM {{#ID-ayants-droit-deplies}} ad` /
> `{{#ID-dossiers-avec-ayants-droit}}` pour éviter la duplication.

---

# 1. Étudier les volumes

## 1.1 — Total ayants droit & dossiers avec au moins un ayant droit

```sql
SELECT
  (SELECT count(*) FROM usager)                            AS total_dossiers,
  count(*)                                                 AS total_ayants_droits,
  count(DISTINCT usager_uuid)                              AS dossiers_avec_ad,
  round(100.0 * count(DISTINCT usager_uuid)
        / (SELECT count(*) FROM usager), 2)                AS part_dossiers_avec_ad_pct
FROM (
  SELECT u.uuid AS usager_uuid
  FROM usager u
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
         THEN u."ayantsDroits" ELSE '[]'::jsonb END) ad
) t;
```

## 1.2 — Distribution du nombre d'ayants droit par dossier (0, 1, 2, 3, 4, 5+)

```sql
WITH dossiers AS (
  SELECT
    u.uuid,
    COALESCE(jsonb_array_length(
      CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
           THEN u."ayantsDroits" END), 0) AS nb
  FROM usager u
)
SELECT
  CASE WHEN nb >= 5 THEN '5+' ELSE nb::text END      AS nb_ayants_droits,
  count(*)                                           AS nb_dossiers,
  round(100.0 * count(*) / sum(count(*)) OVER (), 2) AS part_pct
FROM dossiers
GROUP BY 1
ORDER BY min(nb);
```

## 1.3 — Répartition par lien de parenté

```sql
WITH ad AS (
  SELECT x.value->>'lien' AS lien
  FROM usager u
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
         THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
)
SELECT
  COALESCE(lien, '(non renseigné)')                  AS lien,
  count(*)                                           AS nb_ayants_droits,
  round(100.0 * count(*) / sum(count(*)) OVER (), 2) AS part_pct
FROM ad
GROUP BY 1
ORDER BY nb_ayants_droits DESC;
```

## 1.4 — Dossiers avec un conjoint en ayant droit ⭐ (le chiffre attendu)

```sql
WITH dossiers_conjoint AS (
  SELECT DISTINCT u.uuid
  FROM usager u
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
         THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
  WHERE x->>'lien' = 'CONJOINT'
)
SELECT
  (SELECT count(*) FROM usager)                    AS total_dossiers,
  (SELECT count(*) FROM dossiers_conjoint)         AS dossiers_avec_conjoint,
  round(100.0 * (SELECT count(*) FROM dossiers_conjoint)
        / (SELECT count(*) FROM usager), 2)        AS part_pct;
```

## 1.5 — Dossiers avec au moins un enfant majeur, et nombre d'enfants majeurs

« Enfant majeur » = `lien = 'ENFANT'` **et** âge révolu ≥ 18 ans à aujourd'hui
(les enfants sans date de naissance ne sont pas comptés comme majeurs).

```sql
WITH enfants_majeurs AS (
  SELECT
    u.uuid AS usager_uuid
  FROM usager u
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
         THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
  WHERE x->>'lien' = 'ENFANT'
    AND NULLIF(x->>'dateNaissance', '') IS NOT NULL
    AND date_part('year', age((x->>'dateNaissance')::timestamptz)) >= 18
)
SELECT
  (SELECT count(*) FROM usager)                       AS total_dossiers,
  count(*)                                            AS nb_enfants_majeurs,
  count(DISTINCT usager_uuid)                         AS dossiers_avec_enfant_majeur,
  round(100.0 * count(DISTINCT usager_uuid)
        / (SELECT count(*) FROM usager), 2)           AS part_dossiers_pct
FROM enfants_majeurs;
```

---

# 2. Étudier les structures et leur comportement

> But : savoir **qui** utilise les ayants droit et **comment**, pour pouvoir
> contacter ces structures et valider la feature.

## 2.1 — Top 20 des structures par nombre d'ayants droit

```sql
WITH ad AS (
  SELECT u."structureId" AS structure_id, u.uuid AS usager_uuid
  FROM usager u
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
         THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
)
SELECT
  s.id                          AS structure_id,
  s.nom                         AS structure,
  s.departement,
  count(*)                      AS nb_ayants_droits,
  count(DISTINCT a.usager_uuid) AS nb_dossiers_avec_ad
FROM ad a
JOIN structure s ON s.id = a.structure_id
GROUP BY s.id, s.nom, s.departement
ORDER BY nb_ayants_droits DESC
LIMIT 20;
```

## 2.2 — Top 20 des structures par nombre de conjoints en ayant droit

```sql
WITH ad AS (
  SELECT u."structureId" AS structure_id, u.uuid AS usager_uuid
  FROM usager u
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
         THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
  WHERE x->>'lien' = 'CONJOINT'
)
SELECT
  s.id                          AS structure_id,
  s.nom                         AS structure,
  s.departement,
  count(*)                      AS nb_conjoints,
  count(DISTINCT a.usager_uuid) AS nb_dossiers_avec_conjoint
FROM ad a
JOIN structure s ON s.id = a.structure_id
GROUP BY s.id, s.nom, s.departement
ORDER BY nb_conjoints DESC
LIMIT 20;
```

## 2.3 — Top 20 des structures par nombre d'enfants majeurs en ayant droit

```sql
WITH ad AS (
  SELECT u."structureId" AS structure_id, u.uuid AS usager_uuid
  FROM usager u
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
         THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
  WHERE x->>'lien' = 'ENFANT'
    AND NULLIF(x->>'dateNaissance', '') IS NOT NULL
    AND date_part('year', age((x->>'dateNaissance')::timestamptz)) >= 18
)
SELECT
  s.id                          AS structure_id,
  s.nom                         AS structure,
  s.departement,
  count(*)                      AS nb_enfants_majeurs,
  count(DISTINCT a.usager_uuid) AS nb_dossiers
FROM ad a
JOIN structure s ON s.id = a.structure_id
GROUP BY s.id, s.nom, s.departement
ORDER BY nb_enfants_majeurs DESC
LIMIT 20;
```

---

# 3. Cohérence avec l'entretien

> `usager_entretien.typeMenage` est la seule donnée qui décrit la famille
> indépendamment des ayants droit. Un fort écart entre les deux = les
> structures ne représentent pas les couples de la même façon, et le nombre de
> conjoints en ayant droit ne raconte qu'une partie de l'histoire.

Valeurs de `typeMenage` :
`COUPLE_AVEC_ENFANT`, `COUPLE_SANS_ENFANT`, `HOMME_ISOLE_AVEC_ENFANT`,
`HOMME_ISOLE_SANS_ENFANT`, `FEMME_ISOLE_AVEC_ENFANT`, `FEMME_ISOLE_SANS_ENFANT`.

## 3.0 — Vue d'ensemble : croisement typeMenage × présence d'un conjoint en AD

```sql
WITH d AS (
  SELECT
    u.uuid,
    e."typeMenage" AS type_menage,
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
             THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
      WHERE x->>'lien' = 'CONJOINT'
    ) AS a_conjoint_ad
  FROM usager u
  LEFT JOIN usager_entretien e ON e."usagerUUID" = u.uuid
)
SELECT
  COALESCE(type_menage, '(entretien non renseigné)') AS type_menage,
  count(*)                                              AS nb_dossiers,
  count(*) FILTER (WHERE a_conjoint_ad)                 AS avec_conjoint_ad,
  count(*) FILTER (WHERE NOT a_conjoint_ad)             AS sans_conjoint_ad,
  round(100.0 * count(*) FILTER (WHERE a_conjoint_ad) / count(*), 1) AS part_avec_conjoint_ad_pct
FROM d
GROUP BY 1
ORDER BY nb_dossiers DESC;
```

## 3.1 — Dossiers déclarés « couple » à l'entretien **sans** conjoint en ayant droit

```sql
WITH d AS (
  SELECT
    u.uuid,
    e."typeMenage" AS type_menage,
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
             THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
      WHERE x->>'lien' = 'CONJOINT'
    ) AS a_conjoint_ad
  FROM usager u
  LEFT JOIN usager_entretien e ON e."usagerUUID" = u.uuid
)
SELECT
  count(*) FILTER (WHERE type_menage IN ('COUPLE_AVEC_ENFANT', 'COUPLE_SANS_ENFANT'))
    AS dossiers_couple_entretien,
  count(*) FILTER (WHERE type_menage IN ('COUPLE_AVEC_ENFANT', 'COUPLE_SANS_ENFANT')
                     AND NOT a_conjoint_ad)
    AS couple_entretien_sans_conjoint_ad,
  round(100.0
    * count(*) FILTER (WHERE type_menage IN ('COUPLE_AVEC_ENFANT', 'COUPLE_SANS_ENFANT')
                         AND NOT a_conjoint_ad)
    / NULLIF(count(*) FILTER (WHERE type_menage IN ('COUPLE_AVEC_ENFANT', 'COUPLE_SANS_ENFANT')), 0)
  , 1) AS part_pct
FROM d;
```

## 3.2 — Dossiers déclarés « isolé » à l'entretien **avec** un conjoint en ayant droit

```sql
WITH d AS (
  SELECT
    u.uuid,
    e."typeMenage" AS type_menage,
    EXISTS (
      SELECT 1 FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(u."ayantsDroits") = 'array'
             THEN u."ayantsDroits" ELSE '[]'::jsonb END) x
      WHERE x->>'lien' = 'CONJOINT'
    ) AS a_conjoint_ad
  FROM usager u
  LEFT JOIN usager_entretien e ON e."usagerUUID" = u.uuid
)
SELECT
  count(*) FILTER (WHERE type_menage LIKE '%ISOLE%')                       AS dossiers_isole_entretien,
  count(*) FILTER (WHERE type_menage LIKE '%ISOLE%' AND a_conjoint_ad)     AS isole_entretien_avec_conjoint_ad,
  round(100.0
    * count(*) FILTER (WHERE type_menage LIKE '%ISOLE%' AND a_conjoint_ad)
    / NULLIF(count(*) FILTER (WHERE type_menage LIKE '%ISOLE%'), 0)
  , 1) AS part_pct
FROM d;
```

---

## Construire les questions sans SQL (éditeur Metabase)

Objectif de cette section : une fois les Modèles A/B créés, **ne plus écrire une
seule ligne de SQL** pour les blocs 1 à 3. On travaille uniquement dans
l'éditeur visuel (« notebook ») de Metabase. Le SQL des blocs ci-dessus reste
là pour **vérifier** que la question visuelle sort le même chiffre.

### Étape 0 — Créer les deux modèles (une seule fois)

Un « modèle » Metabase = une question sauvegardée qu'on marque comme modèle et
qui se comporte ensuite comme une table.

1. **Nouveau** (bouton `+` en haut à droite) → **Question SQL**.
2. Choisir la base **DomiFa** (la base analytique anonymisée), coller le SQL du
   **Modèle A** (`ayants_droit_deplies`), cliquer **Exécuter** (▶) pour vérifier.
3. **Enregistrer** → nom `Modèle A — ayants_droit_deplies` → collection
   **« Familles / ayants droit »** (la créer si besoin).
4. Ouvrir la question enregistrée → menu **…** → **Transformer en modèle**
   (*Turn into a model*).
5. Onglet **Métadonnées** du modèle : vérifier/typer les colonnes —
   - `structure_id` → type **Clé étrangère** ciblant `Structure.ID` (indispensable
     pour la jointure à la souris en 2.x) ;
   - `date_naissance` → **Date/heure** ;
   - `age` → **Nombre** ;
   - `est_enfant_majeur` → **Catégorie** ou booléen ;
   - `lien`, `usager_statut` → **Catégorie**.
   Enregistrer.
6. Refaire les points 1 → 5 pour le **Modèle B**
   (`Modèle B — dossiers_avec_ayants_droit`). Typer `structure_id` en clé
   étrangère, `type_menage` / `usager_statut` en catégorie, tous les `nb_*` en
   nombre.

À partir d'ici, dans **Nouveau → Question**, les deux modèles apparaissent comme
sources sous **Modèles → Familles / ayants droit**.

### Vocabulaire de l'éditeur visuel

| Bouton éditeur | Équivalent SQL |
|---|---|
| **Filtrer** | `WHERE` |
| **Résumer** → *Compter les lignes* | `count(*)` |
| **Résumer** → *Nombre de valeurs distinctes de X* | `count(DISTINCT x)` |
| **Résumer** → « Regrouper par » | `GROUP BY` |
| **Colonne personnalisée** | colonne calculée (`CASE`, `>`, `concat`…) |
| **Joindre les données** | `JOIN` |
| **Trier** | `ORDER BY` |
| **Limite de lignes** | `LIMIT` |

> **Où on ne peut PAS se passer de SQL** : les pourcentages « X sur le total »
> dans une **même** question (`count(*) OVER ()`). Solutions à la souris :
> afficher le numérateur et le total en **deux questions** posées côte à côte
> sur le dashboard, ou utiliser la visualisation **« Nombre »** avec un objectif.
> Sinon on garde le bloc SQL correspondant. Les chiffres bruts (numérateur +
> total) suffisent à l'analyse.

---

### Bloc 1 — Volumes

#### 1.1 — Total ayants droit + dossiers avec au moins un ayant droit

Trois questions distinctes (ou une seule avec plusieurs métriques) :

- **Total ayants droit** — Source **Modèle A** → **Résumer** → *Compter les
  lignes*. (Modèle A = 1 ligne par ayant droit, donc le décompte brut = total AD.)
- **Dossiers avec ≥ 1 AD** — Source **Modèle A** → **Résumer** → *Nombre de
  valeurs distinctes de* `usager_uuid`.
- **Total dossiers** — Source **Modèle B** → **Résumer** → *Compter les lignes*.
  (Modèle B = 1 ligne par dossier, y compris ceux à 0 AD.)

Part (%) = « Dossiers avec ≥ 1 AD » ÷ « Total dossiers », affichée en juxtaposant
les deux cartes sur le dashboard.

#### 1.2 — Distribution du nombre d'ayants droit par dossier (0, 1, 2, 3, 4, 5+)

Source **Modèle B**.

1. **Colonne personnalisée** → nom `tranche` → expression :
   ```
   case([nb_ayants_droits] >= 5, "5+", concat([nb_ayants_droits], ""))
   ```
   (le `concat(... , "")` force le texte, sinon Metabase refuse de mélanger
   nombre et `"5+"`).
2. **Résumer** → *Compter les lignes*.
3. « Regrouper par » → `tranche`.
4. **Trier** → `tranche` croissant (l'ordre texte `0,1,2,3,4,5+` est correct ici).
5. Visualisation : **Barres**.

#### 1.3 — Répartition par lien de parenté

Source **Modèle A**.

1. **Résumer** → *Compter les lignes*.
2. « Regrouper par » → `lien`.
3. **Trier** → « Décompte » décroissant.
4. Visualisation : **Camembert** (ou barres). Les liens `NULL` apparaissent comme
   une part « vide » — c'est voulu (cf. limites connues).

#### 1.4 — Dossiers avec un conjoint en ayant droit ⭐

Source **Modèle B**.

1. **Filtrer** → `nb_conjoints` → **Supérieur à** → `0`.
2. **Résumer** → *Compter les lignes*.
3. Visualisation : **Nombre**.

Pour le % : poser à côté la carte « Total dossiers » (1.1) ; ou dupliquer cette
question sans le filtre et utiliser deux séries.

#### 1.5 — Dossiers avec au moins un enfant majeur + nombre d'enfants majeurs

Source **Modèle A**.

1. **Filtrer** → `est_enfant_majeur` → **est vrai** (`true`).
2. **Résumer**, deux métriques :
   - *Compter les lignes* → **nombre d'enfants majeurs** ;
   - *Nombre de valeurs distinctes de* `usager_uuid` → **nombre de dossiers**.
3. Pas de regroupement → une ligne, deux colonnes. Visualisation : **Nombre** ou
   **Tableau**.

> `est_enfant_majeur` vaut déjà `false` pour tout ce qui n'est pas un enfant
> avec date de naissance et ≥ 18 ans : le filtre `= true` suffit, pas besoin de
> re-filtrer sur `lien`.

---

### Bloc 2 — Structures (Top 20)

Les trois questions suivent le **même squelette**, seul le filtre change. Toutes
sur le **Modèle A**.

**Squelette commun :**

1. Source **Modèle A**.
2. **Joindre les données** → table **Structure** → condition
   `structure_id` (Modèle A) = `ID` (Structure). Type **jointure gauche**.
   *(possible à la souris seulement si `structure_id` est typé « clé étrangère »
   dans les métadonnées du modèle — cf. Étape 0.5.)*
3. **Résumer**, deux métriques :
   - *Compter les lignes* ;
   - *Nombre de valeurs distinctes de* `usager_uuid`.
4. « Regrouper par » → `Structure → Nom` **et** `Structure → Departement`.
5. **Trier** → « Décompte » décroissant.
6. **Limite de lignes** → `20`.
7. Visualisation : **Tableau**.

| Question | Étape en plus (avant le « Résumer ») |
|---|---|
| 2.1 — Top structures / ayants droit | aucune |
| 2.2 — Top structures / conjoints | **Filtrer** → `lien` → **est** → `CONJOINT` |
| 2.3 — Top structures / enfants majeurs | **Filtrer** → `est_enfant_majeur` → **est vrai** |

---

### Bloc 3 — Cohérence avec l'entretien

Toutes sur le **Modèle B** (il porte déjà `type_menage` et `nb_conjoints`).

**Colonne personnalisée commune** aux trois, à recréer dans chaque question :
nom `a_conjoint_ad`, expression :
```
case([nb_conjoints] > 0, "avec conjoint AD", "sans conjoint AD")
```

#### 3.0 — Croisement typeMenage × présence d'un conjoint en AD

1. Colonne perso `a_conjoint_ad` (ci-dessus).
2. **Résumer** → *Compter les lignes*.
3. « Regrouper par » → `type_menage` **et** `a_conjoint_ad`.
4. Visualisation : **Tableau croisé dynamique** (*pivot table*) — `type_menage`
   en lignes, `a_conjoint_ad` en colonnes, « Décompte » dans les cellules.
5. Les dossiers sans entretien apparaissent sur une ligne `type_menage` vide :
   la renommer « (entretien non renseigné) » via les réglages de visualisation
   si besoin.

#### 3.1 — Dossiers « couple » à l'entretien **sans** conjoint en AD

1. **Filtrer** → `type_menage` → **est** → cocher `COUPLE_AVEC_ENFANT` **et**
   `COUPLE_SANS_ENFANT`.
2. Colonne perso `a_conjoint_ad`.
3. **Résumer** → *Compter les lignes*, « Regrouper par » `a_conjoint_ad`.
4. Lecture directe : la ligne « sans conjoint AD » = le chiffre cherché ; le
   total des deux lignes = « dossiers couple à l'entretien ».

#### 3.2 — Dossiers « isolé » à l'entretien **avec** un conjoint en AD

1. **Filtrer** → `type_menage` → **contient** → `ISOLE`
   *(capture `HOMME_ISOLE_*` et `FEMME_ISOLE_*` d'un coup)*.
2. Colonne perso `a_conjoint_ad`.
3. **Résumer** → *Compter les lignes*, « Regrouper par » `a_conjoint_ad`.
4. La ligne « avec conjoint AD » = le chiffre cherché (incohérence isolé + conjoint).

---

### Vérifier une question

Pour chaque question construite à la souris : ouvrir le bloc SQL correspondant
plus haut dans une question SQL jetable, exécuter, comparer le nombre. Ils
doivent être identiques (au filtrage de `statut` près — ici : aucun filtre).

---

## Montage du dashboard Metabase

1. Créer **Modèle A** et **Modèle B** (section ci-dessus), les ranger dans une
   collection « Familles / ayants droit ».
2. Créer une question par bloc ci-dessus (garder la numérotation dans le titre
   pour suivre la checklist du ticket). Privilégier l'**éditeur** sur les
   Modèles A/B (voir « Construire les questions sans SQL ») ; garder le SQL natif
   uniquement quand un % ou un `OVER ()` le justifie.
3. Dashboard « Usage des ayants droit » avec 3 sections :
   - **Volumes** : 1.1 (chiffres clés), 1.2 (barres), 1.3 (camembert/barres),
     1.4 (chiffre + %), 1.5 (chiffre + %).
   - **Structures** : 2.1 / 2.2 / 2.3 en tableaux.
   - **Cohérence entretien** : 3.0 (tableau croisé), 3.1, 3.2.
4. Mettre en avant **1.4** (conjoint en ayant droit) — c'est la métrique de
   référence pour cadrer la feature.

## Limites connues

- Âge des enfants calculé sur une date de naissance **tronquée au mois** : marge
  d'erreur d'au plus 1 mois sur le passage à 18 ans, négligeable pour un volume.
- `lien` peut être `NULL` sur d'anciens dossiers → visible dans le bloc 1.3.
- Le rapprochement effectif « le conjoint en ayant droit correspond-il à un
  titulaire d'un autre dossier ? » n'est **pas** faisable ici (noms fakés) :
  c'est l'objet du ticket suivant (script sur base non anonymisée).

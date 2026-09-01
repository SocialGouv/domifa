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

## Montage du dashboard Metabase

1. Créer **Modèle A** et **Modèle B** (section ci-dessus), les ranger dans une
   collection « Familles / ayants droit ».
2. Créer une question native par bloc ci-dessus (garder la numérotation dans le
   titre pour suivre la checklist du ticket).
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

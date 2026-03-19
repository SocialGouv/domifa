# Audit des classes Bootstrap restantes dans le frontend DomiFa

**Date** : 2026-03-19
**Périmètre** : `packages/frontend/src/**/*.html`

---

## Résumé global

| Catégorie                                                          | Occurrences | Fichiers touchés  |
| ------------------------------------------------------------------ | :---------: | :---------------: |
| Spacing (`m-*`, `p-*`, `mt-*`, etc.)                               |   **282**   |        47         |
| Formulaires (`form-control`, `form-group`, etc.)                   |   **295**   |        36         |
| Boutons (`btn`, `btn-*`)                                           |   **287**   |        76         |
| Tables (`table`, `table-striped`, etc.)                            |   **243**   |        23         |
| Texte/Typo (`text-center`, `text-danger`, etc.)                    |   **51**    |        41         |
| Display (`d-none`, `d-flex`, `d-block`, etc.)                      |   **23**    |        10         |
| Flex/Align (`align-items-*`, `justify-content-*`, `flex-shrink-*`) |   **18**    |         9         |
| Typo bold/lead (`fw-bold`, `lead`, etc.)                           |    **7**    |         6         |
| Borders/Rounded (`border`, `rounded`, etc.)                        |    **3**    |         3         |
| Grid/Layout (`container`, `col-offset-*`)                          |    **3**    |         3         |
| Couleurs BG (`bg-white`, `bg-transparent`, etc.)                   |    **2**    |         1         |
| **TOTAL**                                                          | **~1 214**  | **~90+ fichiers** |

---

## Détail par catégorie

### 1. Formulaires — 295 occurrences (36 fichiers)

Classes : `form-control`, `form-group`, `form-label`, `form-check`, `form-select`, `input-group`, `form-text`, `invalid-feedback`, `was-validated`

| Fichier                                                                                                               |    Occ.    |
| --------------------------------------------------------------------------------------------------------------------- | :--------: |
| `structures/components/structures-form/structures-form.component.html`                                                |     39     |
| `structures/components/structure-edit-form/structure-edit-form.component.html`                                        |     36     |
| `usager-dossier/components/step-etat-civil/step-etat-civil.component.html`                                            |     25     |
| `usager-shared/components/profil-etat-civil-form/profil-etat-civil-form.component.html`                               |     25     |
| `usager-dossier/components/decision-refus-form/decision-refus-form.component.html`                                    |     20     |
| `usager-shared/components/entretien-form/entretien-form.component.html`                                               |     10     |
| `usager-dossier/components/decision-valide-form/decision-valide-form.component.html`                                  |     10     |
| `general/components/contact-support/contact-support.component.html`                                                   |     10     |
| `usager-dossier/components/step-rdv/step-rdv.component.html`                                                          |     9      |
| `structures/components/register-user/register-user.component.html`                                                    |     9      |
| `structure-stats/components/reporting-form/reporting-form.component.html`                                             |     8      |
| `admin-portail-usagers/components/manage-structure-information-form/manage-structure-information-form.component.html` |     8      |
| `auth/components/login/login-form.component.html`                                                                     |     6      |
| `manage-users/components/edit-user/edit-user.component.html`                                                          |     6      |
| `manage-users/components/register-user-admin/register-user-admin.component.html`                                      |     6      |
| `users/components/reset-password/reset-password.component.html`                                                       |     5      |
| `usager-shared/components/form-contact-details/form-contact-details.component.html`                                   |     4      |
| `usager-shared/components/upload/upload.component.html`                                                               |     4      |
| `usager-shared/components/input-phone-international/input-phone-international.component.html`                         |     4      |
| `usager-dossier/components/decision-standby-form/decision-standby-form.component.html`                                |     4      |
| `structures/components/structures-sms-form/structures-sms-form.component.html`                                        |     4      |
| `usager-shared/components/decision-radiation-form/decision-radiation-form.component.html`                             |     4      |
| `usager-profil/components/_courriers/profil-procuration-courrier/profil-procuration-courrier.html`                    |     10     |
| `usager-profil/components/_courriers/profil-transfert-courrier/profil-transfert-courrier.html`                        |     8      |
| Autres (12 fichiers)                                                                                                  | 1-2 chacun |

### 2. Boutons (`btn`) — 287 occurrences (76 fichiers)

Classe `btn` utilisée massivement. Fichiers les plus impactés :

| Fichier                                                                                                |    Occ.    |
| ------------------------------------------------------------------------------------------------------ | :--------: |
| `general/components/faq/fragments/faq-video-tutorial/faq-video-tutorial.component.html`                |     12     |
| `usager-profil/components/_courriers/profil-procuration-courrier/profil-procuration-courrier.html`     |     11     |
| `usager-dossier/components/step-decision/step-decision.component.html`                                 |     11     |
| `usager-dossier/components/decision-valide-form/decision-valide-form.component.html`                   |     9      |
| `manage-users/components/user-profil/user-profil.component.html`                                       |     8      |
| `usager-shared/components/interactions/set-interaction-in-form/set-interaction-in-form.component.html` |     8      |
| `usager-profil/components/_courriers/profil-transfert-courrier/profil-transfert-courrier.html`         |     8      |
| `usager-profil/components/profil-head/profil-head.component.html`                                      |     7      |
| `general/components/decouvrir-domifa/decouvrir-domifa.component.html`                                  |     7      |
| `usager-dossier/components/decision-refus-form/decision-refus-form.component.html`                     |     7      |
| `general/components/static-pages/landing-page-portail/landing-page-portail.component.html`             |     6      |
| `usager-shared/components/delete-usager-menu/delete-usager-menu.component.html`                        |     6      |
| `manage-users/components/edit-user/edit-user.component.html`                                           |     6      |
| `usager-dossier/components/step-etat-civil/step-etat-civil.component.html`                             |     6      |
| `structures/components/structures-edit/structures-edit.component.html`                                 |     6      |
| `usager-profil/components/pages/profil-dossier/profil-dossier.component.html`                          |     6      |
| Autres (60 fichiers)                                                                                   | 1-5 chacun |

> **Note** : Beaucoup de `btn` sont probablement utilisés avec `fr-btn` (DSFR). À vérifier au cas par cas.

### 3. Spacing (`m-*`, `p-*`) — 282 occurrences (47 fichiers)

Classes : `fr-m-0w` à `m-5`, `mt-*`, `mb-*`, `ms-*`, `me-*`, `mx-*`, `my-*`, `p-0` à `p-5`, `pt-*`, `pb-*`, `ps-*`, `pe-*`, `px-*`, `py-*`, `ml-*`, `mr-*`

| Fichier                                                                                       |    Occ.    |
| --------------------------------------------------------------------------------------------- | :--------: |
| `stats/components/impact/impact.component.html`                                               |     42     |
| `stats/components/public-stats/public-stats.component.html`                                   |     38     |
| `structures/components/structures-form/structures-form.component.html`                        |     39     |
| `general/components/home/home.component.html`                                                 |     19     |
| `structures/components/register-user/register-user.component.html`                            |     12     |
| `general/components/decouvrir-domifa/decouvrir-domifa.component.html`                         |     10     |
| `general/components/faq/fragments/faq-usage/faq-usage.component.html`                         |     9      |
| `structures/components/structures-search/structures-search.component.html`                    |     9      |
| `usager-profil/components/pages/profil-general-section/profil-general-section.component.html` |     8      |
| `stats/components/elements/stats-charts/stats-charts.component.html`                          |     5      |
| `stats/components/home-stats/home-stats.component.html`                                       |     5      |
| `usager-profil/components/pages/profil-dossier/profil-dossier.component.html`                 |     5      |
| `usager-dossier/components/step-decision/step-decision.component.html`                        |     5      |
| `shared/components/fonction-selection/fonction-selection.component.html`                      |     5      |
| `general/components/faq/faq.component.html`                                                   |     5      |
| `usager-profil/components/profil-head/profil-head.component.html`                             |     5      |
| Autres (31 fichiers)                                                                          | 1-4 chacun |

### 4. Tables — 243 occurrences (23 fichiers)

Classes : `table`, `table-striped`, `table-hover`, `table-bordered`, `table-responsive`, `table-sm`

| Fichier                                                                                                              |    Occ.    |
| -------------------------------------------------------------------------------------------------------------------- | :--------: |
| `structure-stats/components/structure-stats/structure-stats.component.html`                                          |    118     |
| `manage-usagers/components/manage-usagers-table/manage-usagers-table.html`                                           |     16     |
| `usager-profil/components/_documents/profil-structure-documents/profil-structure-docs.component.html`                |     11     |
| `structures/components/structures-custom-docs-table/structures-custom-docs-table.component.html`                     |     11     |
| `usager-shared/components/display-usager-docs/display-usager-docs.component.html`                                    |     10     |
| `manage-users/components/user-profil/user-profil.component.html`                                                     |     9      |
| `structure-stats/components/reporting-form/reporting-form.component.html`                                            |     8      |
| `usager-profil/components/_historiques/profil-historique-transferts/profil-historique-transferts.component.html`     |     7      |
| `usager-profil/components/_historiques/profil-historique-procurations/profil-historique-procurations.component.html` |     7      |
| `general/components/static-pages/politique/politique.component.html`                                                 |     6      |
| `usager-profil/components/_historiques/profil-historique-notes/profil-historique-notes.component.html`               |     5      |
| Autres (12 fichiers)                                                                                                 | 1-4 chacun |

> **Note** : Le mot `table` peut aussi correspondre à la balise HTML `<table>`. Un audit ligne par ligne peut être nécessaire pour distinguer les classes Bootstrap des éléments HTML.

### 5. Texte/Typo — 51 occurrences (41 fichiers)

Classes : `text-center`, `text-left`, `text-right`, `text-start`, `text-end`, `text-muted`, `text-danger`, `text-primary`, `text-warning`, `text-success`, `text-uppercase`, `text-truncate`, `text-nowrap`

| Fichier                                                                               |   Occ.   |
| ------------------------------------------------------------------------------------- | :------: |
| `usager-shared/components/delete-usager-menu/delete-usager-menu.component.html`       |    3     |
| `manage-users/components/user-profil/user-profil.component.html`                      |    3     |
| `general/components/decouvrir-domifa/decouvrir-domifa.component.html`                 |    3     |
| `general/components/home/home.component.html`                                         |    3     |
| `app.component.html`                                                                  |    2     |
| `usager-shared/components/display-ayants-droits/display-ayants-droits.component.html` |    2     |
| Autres (35 fichiers)                                                                  | 1 chacun |

### 6. Display — 23 occurrences (10 fichiers)

| Classe           | Occ. | Fichiers                                                           |
| ---------------- | :--: | ------------------------------------------------------------------ |
| `d-none`         |  9   | login-container, home, decouvrir-domifa, faq, public-stats, impact |
| `d-sm-flex`      |  5   | login-container, home, faq                                         |
| `d-block`        |  3   | user-profil, public-stats                                          |
| `d-sm-block`     |  2   | public-stats, impact                                               |
| `d-flex`         |  1   | profil-dossier                                                     |
| `d-inline-block` |  1   | column-informations                                                |
| `d-md-none`      |  1   | public-stats                                                       |
| `d-md-block`     |  1   | decouvrir-domifa                                                   |

### 7. Flex/Align — 18 occurrences (9 fichiers)

| Classe                       | Occ. | Fichiers                                                  |
| ---------------------------- | :--: | --------------------------------------------------------- |
| `align-items-top`            |  4   | impact, public-stats, profil-general-historique-courriers |
| `justify-content-md-between` |  3   | manage-usagers-page                                       |
| `flex-md-grow-0`             |  3   | home, decouvrir-domifa                                    |
| `justify-content-md-end`     |  2   | decouvrir-domifa                                          |
| `align-content-center`       |  2   | login-container, faq                                      |
| `align-items-stretch`        |  1   | public-stats                                              |
| `align-items-left`           |  1   | login-container                                           |
| `justify-content-md-start`   |  1   | manage-usagers-table                                      |
| `flex-shrink-0`              |  1   | login-container                                           |

### 8. Typo bold/lead — 7 occurrences (6 fichiers)

Classes : `fw-bold`, `lead`

| Fichier                                                               | Occ. |
| --------------------------------------------------------------------- | :--: |
| `usager-dossier/components/step-rdv/step-rdv.component.html`          |  2   |
| `stats/components/public-stats/public-stats.component.html`           |  1   |
| `general/components/home/home.component.html`                         |  1   |
| `general/components/faq/faq.component.html`                           |  1   |
| `general/components/decouvrir-domifa/decouvrir-domifa.component.html` |  1   |
| `general/components/contact-support/contact-support.component.html`   |  1   |

### 9. Borders/Rounded — 3 occurrences (3 fichiers)

| Fichier                                                               | Occ. |
| --------------------------------------------------------------------- | :--: |
| `general/components/decouvrir-domifa/decouvrir-domifa.component.html` |  1   |
| `stats/components/elements/impact-line/impact-line.component.html`    |  1   |
| `stats/components/public-stats/public-stats.component.html`           |  1   |

### 10. Grid/Layout — 3 occurrences (3 fichiers)

| Classe                   | Fichier                                                                |
| ------------------------ | ---------------------------------------------------------------------- |
| `container` (sans `fr-`) | `stats/components/public-stats/public-stats.component.html`            |
| `container` (sans `fr-`) | `stats/components/impact/impact.component.html`                        |
| `col-offset-md-3`        | `usager-dossier/components/step-decision/step-decision.component.html` |

### 11. Couleurs BG — 2 occurrences (1 fichier)

| Classe                        | Fichier                                                                    |
| ----------------------------- | -------------------------------------------------------------------------- |
| `bg-white` / `bg-transparent` | `manage-usagers/components/manage-usagers-table/manage-usagers-table.html` |

---

## Top 10 des fichiers les plus impactés

| #   | Fichier                                                                                 | Occ. estimées |
| --- | --------------------------------------------------------------------------------------- | :-----------: |
| 1   | `structure-stats/components/structure-stats/structure-stats.component.html`             |     ~120      |
| 2   | `stats/components/impact/impact.component.html`                                         |      ~45      |
| 3   | `stats/components/public-stats/public-stats.component.html`                             |      ~42      |
| 4   | `structures/components/structures-form/structures-form.component.html`                  |      ~42      |
| 5   | `structures/components/structure-edit-form/structure-edit-form.component.html`          |      ~37      |
| 6   | `usager-shared/components/profil-etat-civil-form/profil-etat-civil-form.component.html` |      ~30      |
| 7   | `usager-dossier/components/step-etat-civil/step-etat-civil.component.html`              |      ~30      |
| 8   | `usager-dossier/components/decision-refus-form/decision-refus-form.component.html`      |      ~27      |
| 9   | `general/components/home/home.component.html`                                           |      ~25      |
| 10  | `usager-dossier/components/decision-valide-form/decision-valide-form.component.html`    |      ~22      |

---

## Top modules les plus impactés

| Module                  | Occ. estimées | Fichiers |
| ----------------------- | :-----------: | :------: |
| `usager-dossier`        |     ~130      |    8     |
| `structures`            |     ~120      |    9     |
| `stats`                 |     ~110      |    6     |
| `usager-profil`         |     ~100      |    15    |
| `usager-shared`         |      ~90      |    12    |
| `general`               |      ~80      |    10    |
| `manage-usagers`        |      ~40      |    5     |
| `structure-stats`       |     ~130      |    2     |
| `manage-users`          |      ~35      |    5     |
| `admin-portail-usagers` |      ~25      |    4     |
| `auth`                  |      ~15      |    2     |
| `shared`                |      ~15      |    5     |
| `import-usagers`        |      ~8       |    1     |
| `users`                 |      ~9       |    1     |
| `usager-notes`          |      ~10      |    3     |

---

## Points positifs (migration DSFR déjà faite)

- **Grid** : Toutes les classes `row`, `col-*` sont migrées vers `fr-grid-row`, `fr-col-*`
- **Flex** : Les classes `flex-column`, `flex-row`, `flex-wrap`, `flex-grow-1` sont migrées vers `fr-flex-*`
- **Container** : Quasi tout migré vers `fr-container` (seulement 2 restants)

## Priorités de nettoyage recommandées

1. **Formulaires (295 occ.)** — Migrer `form-control` → classes DSFR (`fr-input`, `fr-select`, etc.)
2. **Boutons (287 occ.)** — Vérifier les `btn` non accompagnés de `fr-btn` et migrer
3. **Spacing (282 occ.)** — Remplacer `m-*`/`p-*` par les utilitaires DSFR ou CSS custom
4. **Tables (243 occ.)** — Migrer vers `fr-table`
5. **Texte/Display/Flex (99 occ.)** — Remplacer par utilitaires DSFR ou CSS custom

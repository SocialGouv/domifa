# Liste des pages - Suivi Migration DSFR

Bonjour,

Voici la liste complète des pages accessibles via routing dans l'application DomiFa Frontend.
Ce document a été généré pour faciliter le suivi de la migration DSFR et la revue des interfaces.

---

## Pages de l'application

### Pages générales

| Page                         | Route                 | Avancement DSFR | Review PO | Commentaires |
| ---------------------------- | --------------------- | --------------- | --------- | ------------ |
| Page d'accueil               | `/`                   |                 |           |              |
| Accessibilité                | `/accessibilite`      |                 |           |              |
| Contact / Support            | `/contact`            |                 |           |              |
| Nouveautés                   | `/news`               |                 |           |              |
| Découvrir DomiFa             | `/decouvrir-domifa`   |                 |           |              |
| Mentions légales             | `/mentions-legales`   |                 |           |              |
| Politique de confidentialité | `/confidentialite`    |                 |           |              |
| CGU                          | `/cgu`                |                 |           |              |
| Plan du site                 | `/plan-site`          |                 |           |              |
| Landing page Portail Usager  | `/portail-mon-domifa` |                 |           |              |
| Page 404                     | `/404`                |                 |           |              |

---

### Authentification

| Page                          | Route                   | Avancement DSFR | Review PO | Commentaires |
| ----------------------------- | ----------------------- | --------------- | --------- | ------------ |
| Connexion                     | `/connexion`            |                 |           |              |
| Réinitialisation mot de passe | `/users/reset-password` |                 |           |              |

---

### Gestion des usagers

| Page                    | Route     | Avancement DSFR | Review PO | Commentaires |
| ----------------------- | --------- | --------------- | --------- | ------------ |
| Tableau de bord usagers | `/manage` |                 |           |              |

---

### Dossier usager (Création/Édition)

| Page                         | Route                          | Avancement DSFR | Review PO | Commentaires |
| ---------------------------- | ------------------------------ | --------------- | --------- | ------------ |
| Nouveau dossier / État civil | `/usager/nouveau`              |                 |           |              |
| Édition État civil           | `/usager/:id/edit/etat-civil`  |                 |           |              |
| Édition Documents            | `/usager/:id/edit/documents`   |                 |           |              |
| Édition Entretien            | `/usager/:id/edit/entretien`   |                 |           |              |
| Édition Rendez-vous          | `/usager/:id/edit/rendez-vous` |                 |           |              |
| Édition Décision             | `/usager/:id/edit/decision`    |                 |           |              |

---

### Profil usager

| Page                            | Route                             | Avancement DSFR | Review PO | Commentaires |
| ------------------------------- | --------------------------------- | --------------- | --------- | ------------ |
| Profil - Dossier                | `/profil/dossier/:id`             |                 |           |              |
| Profil - Historique             | `/profil/historique/:id/:section` |                 |           |              |
| Profil - Courriers              | `/profil/courriers/:id`           |                 |           |              |
| Profil - SMS Portail            | `/profil/sms/:id`                 |                 |           |              |
| Profil - Informations générales | `/profil/general/:id`             |                 |           |              |
| Profil - Documents              | `/profil/documents/:id`           |                 |           |              |

---

### Structures

| Page                             | Route                     | Avancement DSFR | Review PO | Commentaires |
| -------------------------------- | ------------------------- | --------------- | --------- | ------------ |
| Nouvelle structure / Inscription | `/structures/nouveau`     |                 |           |              |
| Recherche structure              | `/structures/inscription` |                 |           |              |
| Édition structure                | `/structures/edit`        |                 |           |              |
| Documents personnalisés          | `/structures/documents`   |                 |           |              |
| Configuration SMS                | `/structures/sms`         |                 |           |              |

---

### Gestion des utilisateurs

| Page                | Route                      | Avancement DSFR | Review PO | Commentaires |
| ------------------- | -------------------------- | --------------- | --------- | ------------ |
| Mon compte          | `/manage-users/my-account` |                 |           |              |
| Gestion des comptes | `/manage-users/accounts`   |                 |           |              |

---

### Import

| Page           | Route     | Avancement DSFR | Review PO | Commentaires |
| -------------- | --------- | --------------- | --------- | ------------ |
| Import usagers | `/import` |                 |           |              |

---

### Administration Portail Usagers

| Page                         | Route                           | Avancement DSFR | Review PO | Commentaires |
| ---------------------------- | ------------------------------- | --------------- | --------- | ------------ |
| Paramètres portail usagers   | `/portail-usagers`              |                 |           |              |
| Gestion utilisateurs portail | `/portail-usagers/manage`       |                 |           |              |
| Informations structure       | `/portail-usagers/informations` |                 |           |              |

---

### Statistiques

| Page                              | Route                   | Avancement DSFR | Review PO | Commentaires |
| --------------------------------- | ----------------------- | --------------- | --------- | ------------ |
| Statistiques publiques            | `/stats`                |                 |           |              |
| Statistiques publiques par région | `/stats/region/:region` |                 |           |              |
| Impact                            | `/stats/impact`         |                 |           |              |
| Statistiques structure            | `/structure-stats`      |                 |           |              |

---

### FAQ

| Page                              | Route                              | Avancement DSFR | Review PO | Commentaires |
| --------------------------------- | ---------------------------------- | --------------- | --------- | ------------ |
| FAQ principale                    | `/faq`                             |                 |           |              |
| FAQ - Découvrir DomiFa            | `/faq/decouvrir-domifa`            |                 |           |              |
| FAQ - Utiliser DomiFa             | `/faq/utiliser-domifa`             |                 |           |              |
| FAQ - Sécurité et confidentialité | `/faq/securite-et-confidentialite` |                 |           |              |
| FAQ - Fiches pratiques            | `/faq/fiches-pratiques`            |                 |           |              |
| FAQ - Tutoriels vidéos            | `/faq/tutoriels-videos`            |                 |           |              |

---

## Total

**46 pages** identifiées dans l'application

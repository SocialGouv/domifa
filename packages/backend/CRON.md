# Documentation des tâches Cron

Ce document liste toutes les tâches planifiées (cron) de l'application DomiFa et leur rôle.

## 📊 Statistiques et cache

### `public-stats-cache-update`

- **Service**: `PublicStatsService`
- **Horaire**: Tous les jours à 2h00 (Europe/Paris)
- **Rôle**: Met à jour le cache des statistiques publiques pour toutes les régions de France. Ces statistiques alimentent les pages publiques du site et les rapports.
- **MaxRuntime**: 60 minutes

## 📧 Synchronisation et communications

### `brevo-sync-cron`

- **Service**: `BrevoSyncCronService`
- **Horaire**: Tous les jours à 1h00 (Europe/Paris)
- **Rôle**: Synchronise tous les utilisateurs structures avec Brevo (plateforme d'emailing) pour les campagnes de communication et newsletters.
- **MaxRuntime**: 60 minutes
- **Conditions**: Actif uniquement en production

## 📱 SMS - Notifications de fin de domiciliation

Ces crons envoient des SMS 1 mois avant l'expiration de la domiciliation pour rappeler aux usagers de renouveler leur dossier.

### SMS par timezone (18h00 locale)

| Monitor Slug                        | Timezone           | Description              |
| ----------------------------------- | ------------------ | ------------------------ |
| `sms-end-dom-europe-paris`          | Europe/Paris       | France métropolitaine    |
| `sms-end-dom-martinique-guadeloupe` | America/Martinique | Martinique et Guadeloupe |
| `sms-end-dom-cayenne`               | America/Cayenne    | Guyane française         |
| `sms-end-dom-mayotte`               | Indian/Mayotte     | Mayotte                  |
| `sms-end-dom-reunion`               | Indian/Reunion     | La Réunion               |
| `sms-end-dom-maldives`              | Indian/Maldives    | Maldives                 |
| `sms-end-dom-noumea`                | Pacific/Noumea     | Nouvelle-Calédonie       |
| `sms-end-dom-tahiti`                | Pacific/Tahiti     | Polynésie française      |
| `sms-end-dom-wallis`                | Pacific/Wallis     | Wallis-et-Futuna         |
| `sms-end-dom-miquelon`              | America/Miquelon   | Saint-Pierre-et-Miquelon |

- **Service**: `CronSmsFetchEndDomService`
- **Horaire**: Tous les jours à 18h00 (heure locale de chaque timezone)
- **Rôle**:
  1. Identifie les usagers dont la domiciliation expire dans 1 mois
  2. Crée des SMS de rappel pour ces usagers
  3. Programme l'envoi des SMS à 19h00 (heure locale)
- **MaxRuntime**: 30 minutes

## 📱 SMS - Rappels d'interactions

Ces crons envoient des SMS pour rappeler aux usagers de passer récupérer leur courrier selon le planning défini par chaque structure.

### SMS Interactions par timezone (19h00 locale - Du lundi au vendredi)

| Monitor Slug                            | Timezone           | Description              |
| --------------------------------------- | ------------------ | ------------------------ |
| `sms-interaction-europe-paris`          | Europe/Paris       | France métropolitaine    |
| `sms-interaction-martinique-guadeloupe` | America/Martinique | Martinique et Guadeloupe |
| `sms-interaction-cayenne`               | America/Cayenne    | Guyane française         |
| `sms-interaction-mayotte`               | Indian/Mayotte     | Mayotte                  |
| `sms-interaction-reunion`               | Indian/Reunion     | La Réunion               |
| `sms-interaction-maldives`              | Indian/Maldives    | Maldives                 |
| `sms-interaction-noumea`                | Pacific/Noumea     | Nouvelle-Calédonie       |
| `sms-interaction-tahiti`                | Pacific/Tahiti     | Polynésie française      |
| `sms-interaction-wallis`                | Pacific/Wallis     | Wallis-et-Futuna         |
| `sms-interaction-miquelon`              | America/Miquelon   | Saint-Pierre-et-Miquelon |

- **Service**: `CronSmsInteractionSenderService`
- **Horaire**: Du lundi au vendredi à 19h00 (heure locale de chaque timezone)
- **Expression cron**: `0 19 * * 1-5`
- **Rôle**:
  1. Récupère les SMS d'interaction programmés selon le planning de chaque structure
  2. Envoie les SMS aux usagers pour les rappeler de passer récupérer leur courrier
  3. Respecte les préférences de chaque structure (jours actifs, activation SMS)
- **MaxRuntime**: 30 minutes
- **Note**: Les SMS ne sont envoyés que les jours activés dans le planning de chaque structure

## 📱 SMS - Identifiants Mon DomiFa

### `sms-mon-domifa-batch`

- **Service**: `CronSmsMonDomiFaService`
- **Horaire**: Toutes les heures (Europe/Paris)
- **Rôle**: Envoie par batch de 200 les SMS contenant les identifiants de connexion à Mon DomiFa (portail usager). S'arrête automatiquement après 23h.
- **MaxRuntime**: 50 minutes

## 🗄️ Open Data

### `open-data-load-domifa`

- **Service**: `LoadDomifaDataService`
- **Horaire**: Tous les jours à 1h00 (Europe/Paris)
- **Rôle**:
  1. Exporte les données des structures DomiFa vers la base Open Data
  2. Met à jour les informations géographiques et le nombre de domiciliés
  3. Rend les données publiques pour la carte et les recherches
- **MaxRuntime**: 60 minutes
- **Conditions**: Actif uniquement en production

### `open-data-load-soliguide`

- **Service**: `LoadSoliguideDataService`
- **Horaire**: Tous les jours à 3h00 (Europe/Paris)
- **Rôle**:
  1. Importe les données des structures sociales depuis Soliguide (partenaire)
  2. Enrichit la base Open Data avec les structures d'accompagnement social
  3. Met à jour les informations existantes
- **MaxRuntime**: 60 minutes
- **Conditions**: Actif uniquement en production

### `open-data-load-mss`

- **Service**: `LoadMssDataService`
- **Horaire**: Tous les jours à 2h00 (Europe/Paris)
- **Rôle**:
  1. Importe les données des structures depuis Mon Suivi Social (MSS)
  2. Géolocalise et valide les adresses des structures
  3. Détecte et associe les structures MSS existantes dans DomiFa (rayon 300m)
  4. Enrichit la base Open Data avec les structures MSS
- **MaxRuntime**: 60 minutes
- **Conditions**: Actif uniquement en production

## 🧹 Nettoyage et maintenance

### `purge-expired-tokens`

- **Service**: `ExpiredTokenCleaner`
- **Horaire**: Tous les jours à 22h00 (Europe/Paris)
- **Rôle**: Supprime les tokens de réinitialisation de mot de passe expirés (plus de 7 jours) pour maintenir une base de données propre.
- **MaxRuntime**: 15 minutes

### `purge-obsolete-monitoring-data`

- **Service**: `MonitoringCleaner`
- **Horaire**: Tous les jours à 23h00 (Europe/Paris)
- **Rôle**: Supprime les données de monitoring des batchs de plus de 7 jours (statut "success" uniquement) pour économiser l'espace disque.
- **MaxRuntime**: 15 minutes

## 🔧 Monitoring Sentry

Tous les crons sont monitorés via Sentry avec :

- ✅ **Check-ins automatiques** : Début et fin d'exécution
- ⏱️ **Durée d'exécution** : Suivi du temps de traitement
- ❌ **Alertes** : Notification si le cron ne démarre pas ou dépasse le maxRuntime
- 📊 **Historique** : Visualisation des exécutions dans l'interface Sentry

### Configuration Sentry

Chaque cron est configuré avec :

- **checkinMargin** : Marge en minutes avant d'alerter si le cron ne démarre pas (généralement 10-15 min)
- **maxRuntime** : Durée maximale d'exécution en minutes avant alerte
- **timezone** : Timezone correspondant au planning d'exécution

### Accès Sentry

Pour consulter le monitoring des crons dans Sentry :

1. Ouvrir l'interface Sentry du projet DomiFa
2. Aller dans la section "Crons" ou "Monitors"
3. Consulter l'historique et les statistiques de chaque cron

## 📋 Résumé par horaire

| Heure             | Cron(s)                                             |
| ----------------- | --------------------------------------------------- |
| 01h00             | Brevo Sync, Load DomiFa Open Data                   |
| 02h00             | Public Stats Cache, Load MSS Open Data              |
| 03h00             | Load Soliguide Open Data                            |
| 18h00             | SMS Fin Domiciliation (toutes timezones)            |
| 19h00             | SMS Interactions (toutes timezones, lundi-vendredi) |
| 22h00             | Purge Expired Tokens                                |
| 23h00             | Purge Monitoring Data                               |
| Toutes les heures | SMS Mon DomiFa Batch                                |

## 🌍 Timezones supportées

L'application supporte 10 timezones pour l'envoi de SMS aux territoires d'outre-mer :

- Europe/Paris (métropole)
- America/Martinique, America/Guadeloupe (Antilles)
- America/Cayenne (Guyane)
- America/Miquelon (Saint-Pierre-et-Miquelon)
- Indian/Mayotte, Indian/Reunion, Indian/Maldives
- Pacific/Noumea (Nouvelle-Calédonie)
- Pacific/Tahiti (Polynésie)
- Pacific/Wallis (Wallis-et-Futuna)

Cela permet d'envoyer les SMS à une heure locale appropriée pour chaque territoire.

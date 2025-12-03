# DomiFa

> DomiFa est une plateforme numérique qui facilite la gestion de la domiciliation pour les organismes agréés et permet aux personnes sans domicile stable d'accéder à leurs droits.

🌐 **Homepage** : https://domifa.fabrique.social.gouv.fr

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version LTS recommandée)
- Pnpm (gestionnaire de packages)
- Docker et Docker Compose
- PostgreSQL (ou via Docker)

### Installation rapide

```bash
# 1. Cloner le projet
git clone https://github.com/SocialGouv/domifa.git
cd domifa

# 2. Lancer l'environnement de développement
docker-compose up -d

# 3. Installer les dépendances
pnpm install

# 4. Démarrer le projet en mode développement
pnpm dev
```

L'application sera accessible sur :

- Frontend structures : http://localhost:4200
- Portail domiciliés : http://localhost:4201
- Interface admin : http://localhost:4202
- Backend API : http://localhost:3000

## 📁 Architecture du projet

DomiFa utilise une architecture **monorepo** avec plusieurs packages :

```
domifa/
├── packages/
│   ├── backend/              # API NestJS + PostgreSQL
│   ├── frontend/             # Interface structures (Angular)
│   ├── portail-frontend/     # Portail domiciliés (Angular)
│   ├── portail-admins/       # Interface admin (Angular)
│   └── common/               # Types et interfaces partagés
├── _docs/                   # Documentation technique et guides
├── docker/                  # Configurations Docker
└── scripts/                 # Scripts de gestion de la DB
```

## 🛠️ Développement

### Commands principales

```bash
# Développement complet
pnpm dev

# Services individuels
pnpm dev:backend          # Backend seul
pnpm dev:frontend         # Interface structures
pnpm dev:portail-frontend # Portail domiciliés
pnpm dev:portail-admins   # Interface admin

# Tests et qualité
pnpm test
pnpm lint
pnpm build
```

### Base de données

Le projet utilise PostgreSQL avec TypeORM pour les migrations :

## 🔧 Stack technique

### Technologies principales

- **Langage** : TypeScript
- **Frontend** : Angular 17
- **Backend** : NestJS v11 + PostgreSQL
- **Déploiement** : Docker Compose

### Tests disponibles

- **Frontend** : Tests unitaires
- **Portail usagers** : Tests unitaires
- **Backend** : Tests unitaires + tests d'intégration

## 🔗 Liens utiles

### Documentation

- **Documentation technique** : [\_docs/](https://github.com/SocialGouv/domifa/tree/master/_docs)

### Outils de monitoring

- **Sentry Backend** : https://sentry2.fabrique.social.gouv.fr/incubateur/domifa-backend
- **Sentry Frontend** : https://sentry2.fabrique.social.gouv.fr/incubateur/domifa-frontend
- **Sentry Portail** : https://sentry2.fabrique.social.gouv.fr/incubateur/domifa-portail-usagers
- **Matomo** : https://matomo.fabrique.social.gouv.fr

### Services

- **Mails (prod+dev)** : https://app.tipimail.com/
- **Mails (dev)** : https://mailtrap.io/

## Développement

Voir [./\_docs/dev](./_docs/dev).

## OPS

Voir [./\_docs/ops.md](./_docs/ops.md).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FSocialGouv%2Fdomifa.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FSocialGouv%2Fdomifa?ref=badge_large)

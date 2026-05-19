# DomiFa

Application de gestion de la domiciliation pour les personnes sans domicile stable. Monorepo géré par Lerna + pnpm.

## Architecture

```
packages/
  backend/          # API NestJS (TypeScript, TypeORM, PostgreSQL + PostGIS)
  frontend/         # App Angular 19 - interface structures (DSFR)
  portail-usagers/  # App Angular 18 - portail bénéficiaires (DSFR)
  portail-admins/   # App Angular 18 - admin (DSFR)
  common/           # Types et utilitaires partagés
```

## Stack technique

- **Node** >= 22, **pnpm** 10.x, **Lerna** 8.x (independent versioning)
- **Backend** : NestJS 11, TypeORM 0.3, PostgreSQL 16 (PostGIS), Passport JWT, Pino, Swagger
- **Frontends** : Angular 19 (frontend) / Angular 18 (portail-usagers, portail-admins), RxJS, NgRx (frontend), DSFR (toutes les apps)
- **Tests** : Jest (backend + frontends), Supertest (backend HTTP)
- **CI/CD** : GitHub Actions, semantic-release, Docker multi-stage, Kubernetes (Kontinuous)

## Commandes principales

```bash
pnpm install                  # Installer les dépendances
pnpm build                    # Build tous les packages (lerna)
pnpm dev                      # Lancer tous les services en dev
pnpm test                     # Tests tous les packages
pnpm lint                     # Lint tous les packages

# Backend spécifique
pnpm --filter @domifa/backend start:dev        # Dev avec nodemon
pnpm --filter @domifa/backend test             # Tests (nécessite PostgreSQL)
pnpm --filter @domifa/backend db:dev:migrate-up
pnpm --filter @domifa/backend db:dev:migrate-down:last
pnpm --filter @domifa/backend db:dev:generate  # Générer une migration

# Frontend spécifique
pnpm --filter @domifa/frontend start           # ng serve (port 4200)
pnpm --filter @domifa/frontend test
pnpm --filter @domifa/frontend build
```

## Ports locaux

| Service          | Port |
|------------------|------|
| Backend API      | 3000 |
| Swagger docs     | 3000/api/docs |
| Frontend         | 4200 |
| Portail Usagers  | 4201 |
| Portail Admins   | 4202 |
| MinIO (S3)       | 9000/9001 |
| Metabase         | 3002 |

## Base de données

- PostgreSQL 16 + PostGIS, ORM TypeORM
- Migrations : `packages/backend/src/_migrations/`
- Entities : `packages/backend/src/database/entities/**/*Table.typeorm.ts`
- Docker local : `docker-compose.local.yml` (postgres + minio)
- Docker tests : `docker-compose.tests.yml`

## Conventions

### Commits
Conventional Commits obligatoires (commitlint + husky) :
```
type(scope): message
```
Types : `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`
Scopes : `backend`, `frontend`, `portail-usagers`, `portail-admins`, `ci`

### Code style
- Prettier (2 espaces, single quotes)
- ESLint TypeScript
- Pre-commit hook : lint-staged + node-talisman (scan secrets)

### Release
- semantic-release sur push master → crée tag `vX.Y.Z`
- Le tag déclenche automatiquement le workflow production (build Docker + deploy K8s)
- Ne PAS lancer semantic-release sur les branches de feature

## Règles pour Claude

- **Toujours builder `@domifa/common` en premier** si tu modifies des types partagés
- **Langue** : commentaires et messages de commit en anglais, communication en français
- Les tests backend nécessitent une base PostgreSQL locale (`docker-compose.tests.yml`)
- Ne jamais committer de fichiers `.env`, credentials, ou secrets
- Préférer l'édition de fichiers existants à la création de nouveaux fichiers
- Les frontends Angular utilisent des modules (pas standalone components)
- Le backend utilise des modules NestJS avec injection de dépendances
- Timezone : `Europe/Paris` pour tous les services

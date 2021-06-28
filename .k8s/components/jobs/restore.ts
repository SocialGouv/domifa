import { EnvVar } from "kubernetes-models/v1";
import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import { getDevDatabaseParameters } from "@socialgouv/kosko-charts/components/azure-pg/params";

const suffix = process.env.GITHUB_SHA.slice(0, 7);
const pgParams = getDevDatabaseParameters({ suffix });

const manifests = restoreDbJob({
  env: [
    new EnvVar({
      name: "PGDATABASE",
      value: pgParams.database,
    }),
    new EnvVar({
      name: "OWNER",
      value: pgParams.user,
    }),
    new EnvVar({
      name: "FILE",
      value: "./_scripts/db/dumps/domifa_test.postgres.data-only.sql",
    }),
  ],
  project: "cdtn-admin",
});

export default manifests;

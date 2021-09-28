import { getDevDatabaseParameters } from "@socialgouv/kosko-charts/components/azure-pg/params";
import { Job } from "kubernetes-models/batch/v1";
import environments from "@socialgouv/kosko-charts/environments";

const suffix = (process.env.GITHUB_SHA || "").slice(0, 7);
const pgParams = getDevDatabaseParameters({ suffix });
const ciEnv = environments(process.env);

const job = new Job({
  metadata: {
    name: "restore-db",
    namespace: ciEnv.metadata.namespace.name,
    labels: ciEnv.metadata.labels,
    annotations: ciEnv.metadata.annotations
  },
  spec: {
    template: {
      metadata: {},
      spec: {
        volumes: [{
          name: "restore-db-volume",
          emptyDir: {}
        }],
        initContainers: [{
          name: "restore-db-init",
          image: "alpine/git:v2.30.2",
          command: ["git"],
          args: ["clone", "https://github.com/SocialGouv/domifa.git", "/mnt/domifa"],
          volumeMounts: [{
            name: "restore-db-volume",
            mountPath: "/mnt/domifa"
          }]
        }],
        containers: [{
          name: "restore-db",
          image: "postgres:10.16",
          command: ["sh", "-c"],
          args: ["psql < /mnt/domifa/_scripts/db/dumps/domifa_test.postgres.data-only.sql"],
          envFrom: [{
            secretRef: {
              name: "azure-pg-admin-user"
            }
          }],
          env: [{
            name: "PGDATABASE",
            value: pgParams.database,
          }],
          volumeMounts: [{
            name: "restore-db-volume",
            mountPath: "/mnt/domifa"
          }],
        }],
        restartPolicy: "OnFailure",
      },
    },
    ttlSecondsAfterFinished: 86400,
  },
});

export default [job];

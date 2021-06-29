// import { EnvVar } from "kubernetes-models/v1";
// import { restoreDbJob } from "@socialgouv/kosko-charts/components/azure-pg/restore-db.job";
import { getDevDatabaseParameters } from "@socialgouv/kosko-charts/components/azure-pg/params";

const suffix = (process.env.GITHUB_SHA || "").slice(0, 7);
const pgParams = getDevDatabaseParameters({ suffix });

// const manifests = restoreDbJob({
//   env: [
//     new EnvVar({
//       name: "PGDATABASE",
//       value: pgParams.database,
//     }),
//     new EnvVar({
//       name: "OWNER",
//       value: pgParams.user,
//     }),
//     new EnvVar({
//       name: "FILE",
//       value: "./_scripts/db/dumps/domifa_test.postgres.data-only.sql",
//     }),
//   ],
//   project: "domifa",
// });

// export default [manifests];
import { Job } from "kubernetes-models/batch/v1";
import environments from "@socialgouv/kosko-charts/environments";

const ciEnv = environments(process.env);

// const jobSpec = {
//   containers: [{
//     command: ["sh", "-c", restoreScript],
//     env,
//     envFrom: [
//       new EnvFromSource({
//         secretRef: {
//           name: "azure-pg-admin-user-dev",
//         },
//       }),
//       ...envFrom,
//     ],
//     image: `${SOCIALGOUV_DOCKER_IMAGE}:${SOCIALGOUV_DOCKER_VERSION}`,
//     imagePullPolicy: "IfNotPresent",
//     name: "restore-db",
//     resources: {
//       limits: {
//         cpu: "300m",
//         memory: "512Mi",
//       },
//       requests: {
//         cpu: "100m",
//         memory: "64Mi",
//       },
//     },
//     volumeMounts: [
//       {
//         mountPath: "/mnt/data",
//         name: "backups",
//       },
//     ],
//   }],
//   restartPolicy: "OnFailure",
// }

const job = new Job({
  metadata: {
    name: "restore-db",
    namespace: ciEnv.manifest.namespace.name,
    labels: ciEnv.manifest.labels,
    annotations: ciEnv.manifest.annotations
  },
  spec: {
    // backoffLimit: 0,
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

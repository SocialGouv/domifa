import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/app";
import { addEnv } from "@socialgouv/kosko-charts/utils/addEnv";
import { getIngressHost } from "@socialgouv/kosko-charts/utils/getIngressHost";
import { getManifestByKind } from "@socialgouv/kosko-charts/utils/getManifestByKind";
import { ok } from "assert";
import { Deployment } from "kubernetes-models/apps/v1/Deployment";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { getManifests as getFrontendManifests } from "./frontend";
import environments from "@socialgouv/kosko-charts/environments";
import { azureProjectVolume } from "@socialgouv/kosko-charts/components/azure-storage/azureProjectVolume";
import { VolumeMount, Volume } from "kubernetes-models/v1";

type AnyObject = {
  [any: string]: any;
};

interface AddEnvsParams {
  deployment: Deployment;
  data: AnyObject;
  containerIndex?: number;
}

const addEnvs = ({ deployment, data, containerIndex = 0 }: AddEnvsParams) => {
  Object.keys(data).forEach((key) => {
    addEnv({
      deployment,
      data: new EnvVar({ name: key, value: data[key] }),
      containerIndex,
    });
  });
};

export const getManifests = async () => {
  const name = "backend";
  const probesPath = "/healthz";
  const subdomain = "domifa-api";

  const ciEnv = environments(process.env);

  const isDev = !(ciEnv.isPreProduction || ciEnv.isProduction);

  const tag = process.env.CI_COMMIT_TAG
    ? process.env.CI_COMMIT_TAG.slice(1)
    : process.env.CI_COMMIT_SHA
    ? process.env.CI_COMMIT_SHA
    : process.env.GITHUB_SHA;

  const podProbes = ["livenessProbe", "readinessProbe", "startupProbe"].reduce(
    (probes, probe) => ({
      ...probes,
      [probe]: {
        httpGet: {
          path: probesPath,
          port: "http",
        },
        initialDelaySeconds: 30,
        periodSeconds: 15,
      },
    }),
    {}
  );

  const [persistentVolumeClaim, persistentVolume] = azureProjectVolume("files", {
    storage: "5Gi",
  });

  const uploadsVolume = new Volume({
    name: "files",
    persistentVolumeClaim: { claimName: persistentVolumeClaim.metadata!.name! },
  });

  const uploadsVolumeMount = new VolumeMount({
    mountPath: "/mnt/files",
    name: "files",
  });

  const emptyDir = new Volume({ name: "files", emptyDir: {} });

  const manifests = await create(name, {
    env,
    config: {
      subdomain,
      ingress: true,
      withPostgres: true,
      containerPort: 3000,
      subDomainPrefix: ciEnv.isProduction ? `fake-` : `${subdomain}-`,
    },
    deployment: {
      // image: `ghcr.io/socialgouv/domifa/backend:sha-${tag}`,
      image: `harbor.fabrique.social.gouv.fr/domifa/backend:sha-${tag}`,
      volumes: [isDev ? emptyDir : uploadsVolume],
      container: {
        volumeMounts: [uploadsVolumeMount],
        // volumeMounts: [
        //   {
        //     mountPath: "/mnt/files",
        //     name: "domifa-volume",
        //   },
        // ],
        resources: {
          requests: {
            cpu: "50m",
            memory: "128Mi",
          },
          limits: {
            cpu: "200m",
            memory: "256Mi",
          },
        },
        ...podProbes,
      },
    },
  });

  return manifests.concat(
    isDev
      ? []
      : [persistentVolumeClaim, persistentVolume]
  );
};

export default async () => {
  const { env } = process;
  // const ciEnv = environments(env);
  // const { CI_ENVIRONMENT_NAME, PRODUCTION } = env;
  // const isProductionCluster = Boolean(PRODUCTION);
  // const isPreProduction = CI_ENVIRONMENT_NAME === "preprod-dev";
  // const isDev = !isProductionCluster && !isPreProduction;

  const manifests = await getManifests();

  /* pass dynamic deployment URL as env var to the container */
  //@ts-expect-error
  const deployment = getManifestByKind(manifests, Deployment) as Deployment;
  ok(deployment);

  const frontendManifests = await getFrontendManifests();

  addEnvs({
    deployment,
    data: {
      POSTGRES_HOST: "$(PGHOST)",
      POSTGRES_USERNAME: "$(PGUSER)",
      POSTGRES_PASSWORD: "$(PGPASSWORD)",
      POSTGRES_DATABASE: "$(PGDATABASE)",
      DOMIFA_BACKEND_URL: `https://${getIngressHost(manifests)}`,
      DOMIFA_FRONTEND_URL: `https://${getIngressHost(frontendManifests)}`,
    },
  });

  // const volumes = [
  //   ciEnv.isPreProduction || ciEnv.isProduction
  //     ? {
  //         name: "domifa-volume",
  //         azureFile: {
  //           readOnly: false,
  //           shareName: "files",
  //           secretName: "azure-storage",
  //           secretNamespace: "domifa-preprod",
  //         },
  //       } 
  //     : {
  //       name: "domifa-volume",
  //       emptyDir: {},
  //     }
  // ];

  // assert.object(deployment.spec);
  // assert.object(deployment.spec.template.spec);

  // deployment.spec.template.spec.volumes = [
  //   ...(deployment.spec.template.spec.volumes || []),
  //   ...volumes,
  // ];

  return manifests;
};

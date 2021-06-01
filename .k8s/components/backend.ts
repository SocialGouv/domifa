import { ok } from "assert";
import env from "@kosko/env";
// import { assert } from "@sindresorhus/is";
import { addEnv } from "@socialgouv/kosko-charts/utils/addEnv";
import { create } from "@socialgouv/kosko-charts/components/app";
import { getIngressHost } from "@socialgouv/kosko-charts/utils/getIngressHost";
import { getManifestByKind } from "@socialgouv/kosko-charts/utils/getManifestByKind";
import { EnvVar } from "@socialgouv/kosko-charts/node_modules/kubernetes-models/v1/EnvVar";
import { getGithubRegistryImagePath } from "@socialgouv/kosko-charts/utils/getGithubRegistryImagePath";
import { StatefulSet } from "@socialgouv/kosko-charts/node_modules/kubernetes-models/apps/v1/StatefulSet";
import { Deployment } from "@socialgouv/kosko-charts/node_modules/kubernetes-models/apps/v1/Deployment";

import { getManifests as getFrontendManifests } from "./frontend"

type AnyObject = {
  [any: string]: any;
};

interface AddEnvsParams {
  deployment: Deployment | StatefulSet;
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

export const getManifests = (stateful: boolean) => {
  const name = "backend"
  const project = "domifa"
  const probesPath = "/healthz"
  const subdomain = "domifa-api"  

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

  const config = {
    subdomain,
    ingress: true,
    withPostgres: true,
    containerPort: 3000,
    subDomainPrefix: process.env.PRODUCTION ? `fake-` : `${subdomain}-`,
  };

  const image = getGithubRegistryImagePath({ project, name });

  const resources = {
    limits: { cpu: "200m", memory: "256Mi" },
    requests: { cpu: "50m", memory: "128Mi" },
  };

  const volume = {
    name: "domifa-volume",
    mountPath: "/mnt/files",
    size: stateful ? "10Gi" : "2Gi",
    azureFile: {
      secretName: "azure-storage",
      shareName: "domifa-resource",
    }
    // emptyDir: {},
  };

  const container = {
    resources,
    ...podProbes,
  };

  const deployment = { image, container }

  const params = { env, config, deployment, volumes: [volume] };

  return create(name, params);
}

export default () => {
  const { env } = process
  const { CI_ENVIRONMENT_NAME, PRODUCTION } = env;
  const isProductionCluster = Boolean(PRODUCTION);
  
  const isPreProduction = CI_ENVIRONMENT_NAME === "preprod-dev2";
  const isDev = !isProductionCluster && !isPreProduction
  
  const manifests = getManifests(!isDev)
  /* pass dynamic deployment URL as env var to the container */
  //@ts-expect-error
  const deployment = isDev ? getManifestByKind(manifests, Deployment) as Deployment : getManifestByKind(manifests, StatefulSet) as StatefulSet;
  ok(deployment);

  const frontendManifests = getFrontendManifests()

  addEnvs({
    deployment,
    data: {
      POSTGRES_HOST: "$(PGHOST)",
      POSTGRES_USERNAME: "$(PGUSER)",
      POSTGRES_PASSWORD: "$(PGPASSWORD)",
      POSTGRES_DATABASE: "$(PGDATABASE)",
      DOMIFA_HEALTHZ_FRONTEND_URL_FROM_BACKEND: `https://${getIngressHost(frontendManifests)}`
    },
  });

  // const volumes = [isDev ? {
  //   name: "domifa-volume",
  //   emptyDir: {}
  // } : {
  //   name: "domifa-volume",
  //   azureFile: {
  //     readOnly: false,
  //     shareName: "domifa-resource",
  //     secretName: "azure-storage",
  //   }
  // }]

  // assert.object(deployment.spec);
  // assert.object(deployment.spec.template.spec);

  // deployment.spec.template.spec.volumes = [
  //   ...(deployment.spec.template.spec.volumes || []),
  //   ...volumes
  // ]

  return manifests;
};
import { ok } from "assert";
import env from "@kosko/env";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { addEnv } from "@socialgouv/kosko-charts/utils/addEnv";
import { create } from "@socialgouv/kosko-charts/components/app";
import { Deployment } from "kubernetes-models/apps/v1/Deployment";
import { getIngressHost } from "@socialgouv/kosko-charts/utils/getIngressHost";
import { getManifestByKind } from "@socialgouv/kosko-charts/utils/getManifestByKind";
import { getHarborImagePath } from "@socialgouv/kosko-charts/utils/getHarborImagePath";

import { getManifests as getFrontendManifests } from "./frontend"

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

export const getManifests = () => {
  const name = "backend"
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

  const manifests = create(name, {
    env,
    config: {
      subdomain,
      ingress: true,
      withPostgres: true,
      containerPort: 3000,
      subDomainPrefix: process.env.PRODUCTION ? `fake-` : `${subdomain}-`,
    },
    deployment: {
      image: getHarborImagePath({ name }),
      container: {
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

  return manifests
}

export default () => {
  const manifests = getManifests()

    /* pass dynamic deployment URL as env var to the container */
    //@ts-expect-error
    const deployment = getManifestByKind(manifests, Deployment) as Deployment;

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

    return manifests;
};
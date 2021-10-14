import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/nginx";
import { addEnv } from "@socialgouv/kosko-charts/utils/addEnv";
import { getIngressHost } from "@socialgouv/kosko-charts/utils/getIngressHost";
import { getManifestByKind } from "@socialgouv/kosko-charts/utils/getManifestByKind";
import { ok } from "assert";
import { Deployment } from "kubernetes-models/apps/v1/Deployment";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { getManifests as getBackendManifests } from "./backend";
import environments from "@socialgouv/kosko-charts/environments";

export const getManifests = async () => {
  const probesPath = "/";
  const name = "frontend";
  const subdomain = "domifa";
  const ciEnv = environments(process.env);
  const version = ciEnv.tag || `sha-${ciEnv.sha}`;

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

  const manifests = await create(name, {
    env,
    config: {
      subdomain,
    },
    deployment: {
      image: `ghcr.io/socialgouv/domifa/frontend:sha-${version}`,
      ...podProbes,
    },
  });

  return manifests;
};

export default async () => {
  const manifests = await getManifests();

  /* pass dynamic deployment URL as env var to the container */
  //@ts-expect-error
  const deployment = getManifestByKind(manifests, Deployment) as Deployment;

  ok(deployment);

  const backendManifests = await getBackendManifests();

  const backendUrl = new EnvVar({
    name: "DOMIFA_BACKEND_URL",
    value: `https://${getIngressHost(backendManifests)}/`,
  });

  addEnv({ deployment, data: backendUrl });

  return manifests;
};

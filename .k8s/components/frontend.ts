import env from "@kosko/env";
import { create } from "@socialgouv/kosko-charts/components/nginx";
import environments from "@socialgouv/kosko-charts/environments";
import { addEnv } from "@socialgouv/kosko-charts/utils/addEnv";
import { getIngressHost } from "@socialgouv/kosko-charts/utils/getIngressHost";
import { getHarborImagePath } from "@socialgouv/kosko-charts/utils/getHarborImagePath";
import { getManifestByKind } from "@socialgouv/kosko-charts/utils/getManifestByKind";
import { ok } from "assert";
import { Deployment } from "kubernetes-models/apps/v1/Deployment";
import { EnvVar } from "kubernetes-models/v1/EnvVar";
import { getManifests as getBackendManifests } from "./backend";
import { getManifests as getPortailAdminsManifests } from "./portail-admins";

export const getManifests = async () => {
  const probesPath = "/";
  const name = "frontend";
  const subdomain = "domifa";
  const ciEnv = environments(process.env);
  const version = ciEnv.isPreProduction
    ? `preprod-${ciEnv.sha}`
    : ciEnv.tag || `sha-${ciEnv.sha}`;

  const image = getHarborImagePath({ name: "frontend", project: "domifa" });

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
      image,
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

  {
    const backendManifests = await getBackendManifests();

    const backendUrl = new EnvVar({
      name: "DOMIFA_BACKEND_URL",
      value: `https://${getIngressHost(backendManifests)}/`,
    });

    addEnv({ deployment, data: backendUrl });
  }

  {
    const portailAdminsManifests = await getPortailAdminsManifests();
    const portailAdminUrl = new EnvVar({
      name: "DOMIFA_PORTAIL_ADMINS_URL",
      value: `https://${getIngressHost(portailAdminsManifests)}/`,
    });
    addEnv({ deployment, data: portailAdminUrl });
  }

  return manifests;
};

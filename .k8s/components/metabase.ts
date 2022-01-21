import env from "@kosko/env";
import { create as createMetabase } from "@socialgouv/kosko-charts/components/metabase";
import { create as createOauthProxy } from "@socialgouv/kosko-charts/components/oauth2-proxy";
import { Service } from "kubernetes-models/v1";

// create a metabase + oauth2 proxy to add a GitHub auth
const getManifests = async () => {
  if (env.env !== "prod") {
    return [];
  }
  const metabase = await createMetabase("metabase", {
    env,
    config: {
      ingress: false,
    },
  });

  const appService = metabase.find((m) => m.kind === "Service") as Service;
  if (appService && appService?.spec?.ports && appService?.spec?.ports.length) {
    const serviceName = appService.metadata?.name;
    const servicePort = appService?.spec?.ports[0].port;
    const upstream = `http://${serviceName}:${servicePort}`;
    const proxy = await createOauthProxy({
      upstream,
      config: {
        subDomainPrefix: "metabase-",
      },
    });

    return [metabase, proxy];
  }

  return [];
};

export default getManifests;

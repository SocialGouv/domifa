import env from "@kosko/env";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import environments from "@socialgouv/kosko-charts/environments";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";
import { create } from "@socialgouv/kosko-charts/components/azure-pg";

export default async (): Promise<{ kind: string }[]> => {
  if (env.env === "dev") {
    return await create({ env });
  }

  // in prod/preprod, we try to add a fixed sealed-secret
  const secretName = "pg-user.sealed-secret.yaml";
  const secret = (await loadYaml<SealedSecret>(env, secretName));

  if (!secret) {
    return [];
  }

  const envParams = environments(process.env);
  // add annotations
  updateMetadata(secret, {
    annotations: envParams.metadata.annotations ?? {},
    labels: envParams.metadata.labels ?? {},
    namespace: envParams.metadata.namespace,
  });

  return [secret];
};

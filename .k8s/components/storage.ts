import env from "@kosko/env";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import environments from "@socialgouv/kosko-charts/environments";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";

export default async (): Promise<{ kind: string }[]> => {
  const secret = await loadYaml<SealedSecret>(
    env,
    `azure-domifa-volume.sealed-secret.yaml`
  );
  if (!secret) {
    return [];
  }

  const ciEnv = environments(process.env);

  // add gitlab annotations
  updateMetadata(secret, {
    annotations: ciEnv.metadata.annotations ?? {},
    labels: ciEnv.metadata.labels ?? {},
    namespace: ciEnv.metadata.namespace,
  });

  return [secret];
};

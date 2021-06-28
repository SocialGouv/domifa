import env from "@kosko/env";
import type { SealedSecret } from "@kubernetes-models/sealed-secrets/bitnami.com/v1alpha1/SealedSecret";
import gitlab from "@socialgouv/kosko-charts/environments/gitlab";
import { loadYaml } from "@socialgouv/kosko-charts/utils/getEnvironmentComponent";
import { updateMetadata } from "@socialgouv/kosko-charts/utils/updateMetadata";

export default async (): Promise<{ kind: string }[]> => {
  const secret = await loadYaml<SealedSecret>(
    env,
    `azure-storage.sealed-secret.yaml`
  );
  if (!secret) {
    return [];
  }

  const envParams = gitlab(process.env);

  // add gitlab annotations
  updateMetadata(secret, {
    annotations: envParams.manifest.annotations ?? {},
    labels: envParams.manifest.labels ?? {},
    namespace: envParams.manifest.namespace,
  });

  return [secret];
};

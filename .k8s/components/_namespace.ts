import { createNamespace } from "@socialgouv/kosko-charts/components/namespace";

const manifests = createNamespace();

manifests.metadata = {
  ...manifests.metadata,
  annotations: {
    ...manifests.metadata?.annotations,
    "field.cattle.io/creatorId": "github",
    "field.cattle.io/projectId": process.env.RANCHER_PROJECT_ID || ""
  }
}

export default manifests;

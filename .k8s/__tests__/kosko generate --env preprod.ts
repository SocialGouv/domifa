//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
test("kosko generate --preprod", async () => {
  process.env.HARBOR_PROJECT = "domifa";
  process.env.CI_ENVIRONMENT_NAME = "preprod-dev2";
  expect(
    await getEnvManifests("preprod", "", {
      ...project("domifa").preprod,
      RANCHER_PROJECT_ID: "c-gjtkk:p-gv8gc",
    })
  ).toMatchSnapshot();
});

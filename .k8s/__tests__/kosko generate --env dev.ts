//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/github-actions.env";

jest.setTimeout(1000 * 60);
test("kosko generate --dev", async () => {
  expect(
    await getEnvManifests("dev", "", {
      ...project("domifa").dev,
      RANCHER_PROJECT_ID: "c-gjtkk:p-gv8gc",
    })
  ).toMatchSnapshot();
});

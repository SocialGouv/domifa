//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/github-actions.env";

jest.setTimeout(1000 * 60);
test("kosko generate --prod", async () => {
  expect(
    await getEnvManifests("prod", "", {
      ...project("domifa").prod,
      RANCHER_PROJECT_ID: "c-5rj5b:p-wf95s",
    })
  ).toMatchSnapshot();
});

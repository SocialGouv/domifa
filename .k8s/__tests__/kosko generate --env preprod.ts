//

import { getEnvManifests } from "@socialgouv/kosko-charts/testing";
import { project } from "@socialgouv/kosko-charts/testing/fake/gitlab-ci.env";

jest.setTimeout(1000 * 60);
console.log("project(domifa).preprod", project("domifa").preprod);

test("kosko generate --preprod", async () => {
  expect(
    await getEnvManifests("preprod", "", {
      ...project("domifa").preprod,
      RANCHER_PROJECT_ID: "c-gjtkk:p-gv8gc",
    })
  ).toMatchSnapshot();
});

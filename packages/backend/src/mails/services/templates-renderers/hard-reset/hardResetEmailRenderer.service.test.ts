import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
import { hardResetEmailRenderer } from "./hardResetEmailRenderer.service";

describe("hardResetEmailRenderer", () => {
  it("hardResetEmailRenderer render ", async () => {
    const model = {
      prenom: "Paul",
      confirmationCode: "ABCD",
    };
    const { subject, text, html } = await hardResetEmailRenderer.renderTemplate(
      model
    );

    expect(subject).toEqual(
      `[DOMIFA] Confirmez la suppression de tous les usagers`
    );
    expect(text).toContain(model.prenom);
    expect(text).toContain(model.confirmationCode);

    if (domifaConfig().envId === "local") {
      await fs.promises.writeFile(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "hard-reset",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await fs.promises.readFile(
      path.join(
        __dirname,
        "../../../../_static/email-templates",
        "hard-reset",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(refHtml).toEqual(html);
  });
});

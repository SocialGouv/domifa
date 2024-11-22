import { readFile, writeFile } from "fs-extra";
import { join } from "path";

import { format } from "prettier";
import { domifaConfig } from "../../../../../config";
import { userAccountCreatedByAdminEmailRenderer } from "./userAccountCreatedByAdminEmailRenderer.service";
describe("userAccountCreatedByAdminEmailRenderer", () => {
  it("userAccountCreatedByAdminEmailRenderer render ", async () => {
    const model = {
      prenom: "Paul",
      lien: "https://domifa.fabrique.social.gouv.fr/validate",
    };
    const { subject, text, html } =
      await userAccountCreatedByAdminEmailRenderer.renderTemplate(model);

    expect(subject).toEqual("[DOMIFA] Finalisez votre inscription sur Domifa");
    expect(text).toContain(model.prenom);
    expect(text).toContain(model.lien);

    if (domifaConfig().envId === "local") {
      await writeFile(
        join(
          __dirname,
          "../../../../../_static/email-templates",
          "user-account-created-by-admin",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await readFile(
      join(
        __dirname,
        "../../../../../_static/email-templates",
        "user-account-created-by-admin",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});

import { readFile, writeFile } from "fs-extra";
import { join } from "path";

import { format } from "prettier";
import { domifaConfig } from "../../../../../config";
import { userAccountActivatedEmailRenderer } from "./userAccountActivatedEmailRenderer.service";
describe("userAccountActivatedEmailRenderer", () => {
  it("userAccountActivatedEmailRenderer render ", async () => {
    const model = {
      prenom: "Paul",
      lien: "https://domifa.fabrique.social.gouv.fr/connexion",
    };
    const { subject, text, html } =
      await userAccountActivatedEmailRenderer.renderTemplate(model);

    expect(subject).toEqual("[DOMIFA] Votre compte Domifa a été activé");
    expect(text).toContain(model.prenom);
    expect(text).toContain(model.lien);

    if (domifaConfig().envId === "local") {
      await writeFile(
        join(
          __dirname,
          "../../../../../_static/email-templates",
          "user-account-activated",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await readFile(
      join(
        __dirname,
        "../../../../../_static/email-templates",
        "user-account-activated",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});

import { readFile, writeFile } from "fs-extra";
import { join } from "path";

import { format } from "prettier";
import { domifaConfig } from "../../../../../config";
import { guideUtilisateurEmailRenderer } from "./guideUtilisateurEmailRenderer.service";
describe("guideUtilisateurEmailRenderer", () => {
  it("guideUtilisateurEmailRenderer render ", async () => {
    const model = {
      prenom: "Paul",
      lienGuide: "https://domifa/guide",
    };
    const { subject, text, html } =
      await guideUtilisateurEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Découvrez le guide utilisateur DomiFa !`);
    expect(text).toContain(model.prenom);
    expect(text).toContain(model.lienGuide);

    if (domifaConfig().envId === "local") {
      await writeFile(
        join(
          __dirname,
          "../../../../../_static/email-templates",
          "guide-utilisateur",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await readFile(
      join(
        __dirname,
        "../../../../../_static/email-templates",
        "guide-utilisateur",
        "test.ref.html"
      ),
      "utf-8"
    );
    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});

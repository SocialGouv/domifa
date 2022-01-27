import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
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

    if (domifaConfig().envId === "dev") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "guide-utilisateur",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = fs
      .readFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "guide-utilisateur",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

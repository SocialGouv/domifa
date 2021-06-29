import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
import { userAccountActivatedEmailRenderer } from "./userAccountActivatedEmailRenderer.service";
describe("userAccountActivatedEmailRenderer", () => {
  it("userAccountActivatedEmailRenderer render ", async () => {
    const model = {
      prenom: "Paul",
      lien: "https://domifa.fabrique.social.gouv.fr/connexion",
    };
    const { subject, text, html } =
      await userAccountActivatedEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Votre compte Domifa a été activé`);
    expect(text).toContain(model.prenom);
    expect(text).toContain(model.lien);

    if (domifaConfig().envId === "dev") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "user-account-activated",
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
          "user-account-activated",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

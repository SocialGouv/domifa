import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
import { userAccountCreatedByAdminEmailRenderer } from "./userAccountCreatedByAdminEmailRenderer.service";
describe("userAccountCreatedByAdminEmailRenderer", () => {
  it("userAccountCreatedByAdminEmailRenderer render ", async () => {
    const model = {
      prenom: "Paul",
      lien: "https://domifa.fabrique.social.gouv.fr/validate",
    };
    const {
      subject,
      text,
      html,
    } = await userAccountCreatedByAdminEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Finalisez votre inscription sur Domifa`);
    expect(text).toContain(model.prenom);
    expect(text).toContain(model.lien);

    if (domifaConfig().envId === "dev") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "user-account-created-by-admin",
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
          "user-account-created-by-admin",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

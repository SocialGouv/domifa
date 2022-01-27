import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
import { userResetPasswordEmailRenderer } from "./userResetPasswordEmailRenderer.service";
describe("userResetPasswordEmailRenderer", () => {
  it("userResetPasswordEmailRenderer render ", async () => {
    const model = {
      prenom: "Paul",
      lien: "https://domifa/reset-password",
    };
    const { subject, text, html } =
      await userResetPasswordEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Demande d'un nouveau mot de passe`);
    expect(text).toContain(model.prenom);
    expect(text).toContain(model.lien);

    if (domifaConfig().envId === "dev") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "user-reset-password",
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
          "user-reset-password",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

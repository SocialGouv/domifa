import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
import { userAccountCreatedEmailRenderer } from "./userAccountCreatedEmailRenderer.service";
describe("userAccountCreatedEmailRenderer", () => {
  it("userAccountCreatedEmailRenderer render ", async () => {
    const model = {
      admin_prenom: "Sophie",
      user_email: "paul@dupont.com",
      user_nom: "Dupont",
      user_prenom: "Paul",
      lien: "https://domifa/validate",
    };
    const {
      subject,
      text,
      html,
    } = await userAccountCreatedEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(
      `[DOMIFA] Un nouvel utilisateur souhaite rejoindre votre structure`
    );
    expect(text).toContain(model.admin_prenom);
    expect(text).toContain(model.user_email);
    expect(text).toContain(model.user_nom);
    expect(text).toContain(model.user_prenom);
    expect(text).toContain(model.lien);

    if (domifaConfig().envId === "dev") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "user-account-created",
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
          "user-account-created",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

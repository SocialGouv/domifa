import * as fs from "fs";
import * as path from "path";
import { format } from "prettier";
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

    if (domifaConfig().envId === "local") {
      await fs.promises.writeFile(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "user-reset-password",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await fs.promises.readFile(
      path.join(
        __dirname,
        "../../../../_static/email-templates",
        "user-reset-password",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});

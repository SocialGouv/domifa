import * as fs from "fs";
import * as path from "path";
import { contactSupportEmailRenderer } from ".";
import { domifaConfig } from "../../../../config";
import { ContactSupport } from "../../../../_common/model";

describe("guideUtilisateurEmailRenderer", () => {
  it("guideUtilisateurEmailRenderer render ", async () => {
    const model: ContactSupport = {
      userId: 12,
      structureId: 5,
      content: `Un nouveau message a été envoyé à Domifa·
        Structure existante :   Oui··
        Nom : Nom de la structure·
        Email : un-contact-par-mail@test.com·
        Do esse tempor veniam incididunt deserunt ad labore laboris commodo id exercitation sit. Sunt minim tempor ad quis esse est eiusmod incididunt id dolor adipisicing ex excepteur. Consectetur consectetur dolore tempor nisi enim pariatur. Nostrud ea reprehenderit minim pariatur irure. Velit anim qui veniam et in excepteur duis eiusmod est culpa voluptate enim eiusmod laboris. Ut sunt sint magna ullamco nostrud velit est pariatur sit ea consectetur commodo minim.`,
      status: "ON_HOLD",
      email: "un-contact-par-mail@test.com",
      name: "Nom de la structure",
    };

    const { subject, text, html } =
      await contactSupportEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Nouveau message sur le support`);
    expect(text).toContain(model.email);
    expect(text).toContain(model.name);
    expect(text).toContain(model.content);

    if (domifaConfig().envId === "test") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "contact-support",
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
          "contact-support",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

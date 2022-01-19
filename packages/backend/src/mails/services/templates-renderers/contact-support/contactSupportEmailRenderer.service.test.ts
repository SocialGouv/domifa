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
      content:
        "Le Titan Thanos, ayant réussi à s'approprier les six Pierres d'Infinité et à les réunir sur le Gantelet doré, a pu réaliser son objectif de pulvériser la moitié de la population de l'Univers. Cinq ans plus tard, Scott Lang, alias Ant-Man, parvient à s'échapper de la dimension subatomique où il était coincé. Il propose aux Avengers une solution pour faire revenir à la vie tous les êtres disparus, dont leurs alliés et coéquipiers : récupérer les Pierres d'Infinité dans le passé.",
      status: "ON_HOLD",
      email: "un-contact-par-mail@test.com",
      name: "Nom de la structure",
    };

    const { subject, text, html } =
      await contactSupportEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Nouveau messaage sur le support`);
    expect(text).toContain(model.email);
    expect(text).toContain(model.name);
    expect(text).toContain(model.content);

    if (domifaConfig().envId === "test") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../_email-templates",
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
          "../../../_email-templates",
          "contact-support",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

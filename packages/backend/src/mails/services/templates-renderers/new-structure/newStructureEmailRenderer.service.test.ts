import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
import {
  NewStructureEmailModel,
  newStructureEmailRenderer,
} from "./newStructureEmailRenderer.service";
describe("newStructureEmailRenderer", () => {
  it("newStructureEmailRenderer render ", async () => {
    const model: NewStructureEmailModel = {
      lienConfirmation: "https://domifa/confirm",
      lienSuppression: "https://domifa/delete",
      structure: {
        nom: "Structure A",
        adresse: "123 rue AAA",
        codePostal: "75555",
        departement: "75",
        ville: "Paris",
        email: "test@structure.com",
        phone: "010203040506",
        responsable: {
          fonction: "pdg",
          nom: "Dupont",
          prenom: "Sarah",
        },
        structureType: "asso",
      },
      user: {
        nom: "Smith",
        prenom: "Paul",
        email: "smith.paul@mymail.com",
      },
    };

    const {
      subject,
      text,
      html,
    } = await newStructureEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Nouvelle structure sur Domifa`);
    expect(text).toContain(model.user.prenom);
    expect(text).toContain(model.structure.nom);
    expect(text).toContain(model.structure.responsable.fonction);
    expect(text).toContain(model.structure.ville);
    expect(text).toContain(model.lienSuppression);
    expect(text).toContain(model.lienConfirmation);

    if (domifaConfig().envId === "dev") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "new-structure",
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
          "new-structure",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

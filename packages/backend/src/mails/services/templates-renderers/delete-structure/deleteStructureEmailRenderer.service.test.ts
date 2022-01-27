import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
import {
  DeleteStructureEmailModel,
  deleteStructureEmailRenderer,
} from "./deleteStructureEmailRenderer.service";
describe("deleteStructureEmailRenderer", () => {
  it("deleteStructureEmailRenderer render ", async () => {
    const model: DeleteStructureEmailModel = {
      lienSuppression: "https://domifa/delete/confirm",
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
    };
    const { subject, text, html } =
      await deleteStructureEmailRenderer.renderTemplate(model);

    expect(subject).toEqual(`[DOMIFA] Supprimer une structure`);
    expect(text).toContain(model.structure.nom);
    expect(text).toContain(model.structure.responsable.fonction);
    expect(text).toContain(model.structure.ville);
    expect(text).toContain(model.lienSuppression);

    if (domifaConfig().envId === "dev") {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "delete-structure",
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
          "delete-structure",
          "test.ref.html"
        )
      )
      .toString();
    expect(refHtml).toEqual(html);
  });
});

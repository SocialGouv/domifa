import * as fs from "fs";
import * as path from "path";
import { domifaConfig } from "../../../../config";
import {
  DeleteStructureEmailModel,
  deleteStructureEmailRenderer,
} from "./deleteStructureEmailRenderer.service";

import { format } from "prettier";

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
        telephone: {
          numero: "0102030405",
          countryCode: "fr",
        },
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

    if (domifaConfig().envId === "local") {
      await fs.promises.writeFile(
        path.join(
          __dirname,
          "../../../../_static/email-templates",
          "delete-structure",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await fs.promises.readFile(
      path.join(
        __dirname,
        "../../../../_static/email-templates",
        "delete-structure",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});

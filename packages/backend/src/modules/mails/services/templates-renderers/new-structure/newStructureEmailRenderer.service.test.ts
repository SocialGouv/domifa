import { readFile, writeFile } from "fs-extra";
import { join } from "path";

import { format } from "prettier";
import {
  NewStructureEmailModel,
  newStructureEmailRenderer,
} from "./newStructureEmailRenderer.service";
import { domifaConfig } from "../../../../../config";
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
      user: {
        nom: "Smith",
        prenom: "Paul",
        email: "smith.paul@mymail.com",
      },
    };

    const { subject, text, html } =
      await newStructureEmailRenderer.renderTemplate(model);

    expect(subject).toEqual("[DOMIFA] Nouvelle structure sur Domifa");
    expect(text).toContain(model.user.prenom);
    expect(text).toContain(model.structure.nom);
    expect(text).toContain(model.structure.responsable.fonction);
    expect(text).toContain(model.structure.ville);
    expect(text).toContain(model.lienSuppression);
    expect(text).toContain(model.lienConfirmation);

    if (domifaConfig().envId === "local") {
      await writeFile(
        join(
          __dirname,
          "../../../../../_static/email-templates",
          "new-structure",
          "test.tmp.html"
        ),
        html
      );
    }

    const refHtml = await readFile(
      join(
        __dirname,
        "../../../../../_static/email-templates",
        "new-structure",
        "test.ref.html"
      ),
      "utf-8"
    );

    expect(format(refHtml, { parser: "html" })).toEqual(
      format(html, { parser: "html" })
    );
  });
});

import { DomifaMailTemplateRendering } from "../../../../mail-generator/model";
import { domifaMailTemplateRenderer } from "../../../../mail-generator/services/domifaMailTemplateRenderer.service";
import { DEPARTEMENTS_MAP } from "../../../../structures/DEPARTEMENTS_MAP.const";
import { StructurePG } from "../../../../_common/model";
import moment = require("moment");

export type DeleteStructureEmailModel = {
  structure: Pick<
    StructurePG,
    | "nom"
    | "adresse"
    | "ville"
    | "email"
    | "phone"
    | "codePostal"
    | "responsable"
    | "structureType"
    | "departement"
  >;
  lienSuppression: string;
};

async function renderTemplate({
  structure,
  lienSuppression,
}: DeleteStructureEmailModel): Promise<DomifaMailTemplateRendering> {
  const structureTypes = {
    asso: "Organisme agrée",
    ccas: "CCAS",
    cias: "CIAS",
  };
  const model = {
    structure_name: structure.nom,
    structure_type: structureTypes[structure.structureType],
    adresse: structure.adresse,
    departement:
      DEPARTEMENTS_MAP[structure.departement].departmentName || "Non renseigné",
    ville: structure.ville,
    code_postal: structure.codePostal,
    email: structure.email,
    phone: structure.phone,
    responsable_nom: structure.responsable.nom,
    responsable_prenom: structure.responsable.prenom,
    responsable_fonction: structure.responsable.fonction,
    lien_suppression: lienSuppression,
  };

  return await domifaMailTemplateRenderer.renderTemplate(
    "delete-structure",
    model
  );
}

export const deleteStructureEmailRenderer = { renderTemplate };

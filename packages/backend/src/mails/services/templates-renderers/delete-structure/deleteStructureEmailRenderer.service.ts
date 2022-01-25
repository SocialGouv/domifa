import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";
import { DEPARTEMENTS_MAP } from "../../../../structures/constants/DEPARTEMENTS_MAP.const";
import { Structure } from "../../../../_common/model";

export type DeleteStructureEmailModel = {
  structure: Pick<
    Structure,
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
  toSkipString?: string;
};

async function renderTemplate({
  structure,
  lienSuppression,
  toSkipString,
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
    toSkipString,
  };

  return domifaMailTemplateRenderer.renderTemplate("delete-structure", model);
}

export const deleteStructureEmailRenderer = { renderTemplate };

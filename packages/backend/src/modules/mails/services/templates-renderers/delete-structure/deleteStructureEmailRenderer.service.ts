import { getPhoneString } from "../../../../../util";
import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";

import {
  DEPARTEMENTS_MAP,
  STRUCTURE_TYPE_LABELS,
  Structure,
} from "@domifa/common";

export type DeleteStructureEmailModel = {
  structure: Pick<
    Structure,
    | "nom"
    | "adresse"
    | "ville"
    | "email"
    | "telephone"
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
  const model = {
    structure_name: structure.nom,
    structure_type: STRUCTURE_TYPE_LABELS[structure.structureType],
    adresse: structure.adresse,
    departement:
      DEPARTEMENTS_MAP[structure.departement].departmentName || "Non renseigné",
    ville: structure.ville,
    code_postal: structure.codePostal,
    email: structure.email,
    phone: getPhoneString(structure.telephone),
    responsable_nom: structure.responsable.nom,
    responsable_prenom: structure.responsable.prenom,
    responsable_fonction: structure.responsable.fonction,
    lien_suppression: lienSuppression,
    toSkipString,
  };

  return await domifaMailTemplateRenderer.renderTemplate(
    "delete-structure",
    model
  );
}

export const deleteStructureEmailRenderer = { renderTemplate };

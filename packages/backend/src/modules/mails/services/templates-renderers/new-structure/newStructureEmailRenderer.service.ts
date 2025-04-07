import {
  DEPARTEMENTS_MAP,
  STRUCTURE_TYPE_LABELS,
  Structure,
} from "@domifa/common";

import { getPhoneString } from "../../../../../util";
import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";
import { UserForEmail } from "../../../../../_common/model";

export type NewStructureEmailModel = {
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
  user: UserForEmail;
  lienConfirmation: string;
  lienSuppression: string;
  toSkipString?: string;
};

async function renderTemplate({
  user,
  structure,
  lienConfirmation,
  lienSuppression,
  toSkipString,
}: NewStructureEmailModel): Promise<DomifaMailTemplateRendering> {
  const model = {
    structure_name: structure.nom,
    structure_type: STRUCTURE_TYPE_LABELS[structure.structureType],
    adresse: structure.adresse,
    departement: DEPARTEMENTS_MAP[structure.departement].departmentName,
    ville: structure.ville,
    code_postal: structure.codePostal,
    email: structure.email,
    phone: getPhoneString(structure.telephone),
    responsable_nom: structure.responsable.nom,
    responsable_prenom: structure.responsable.prenom,
    responsable_fonction: structure.responsable.fonction,
    user_nom: user.nom,
    user_prenom: user.prenom,
    user_email: user.email,
    lien_confirmation: lienConfirmation,
    lien_suppression: lienSuppression,
    toSkipString,
  };

  return await domifaMailTemplateRenderer.renderTemplate(
    "new-structure",
    model
  );
}

export const newStructureEmailRenderer = { renderTemplate };

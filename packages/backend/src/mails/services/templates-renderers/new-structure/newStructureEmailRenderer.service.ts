import { AppUserForAdminEmail } from "../../../../database";
import { DomifaMailTemplateRendering } from "../../../model";
import { domifaMailTemplateRenderer } from "../../domifaMailTemplateRenderer.service";
import { Structure } from "../../../../_common/model";
import { DEPARTEMENTS_MAP } from "../../../../util/territoires";

export type NewStructureEmailModel = {
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
  user: AppUserForAdminEmail;
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
  const structureTypes = {
    asso: "Organisme agrée",
    ccas: "CCAS",
    cias: "CIAS",
  };
  const model = {
    structure_name: structure.nom,
    structure_type: structureTypes[structure.structureType],
    adresse: structure.adresse,
    departement: DEPARTEMENTS_MAP[structure.departement].departmentName,
    ville: structure.ville,
    code_postal: structure.codePostal,
    email: structure.email,
    phone: structure.phone,
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

  return domifaMailTemplateRenderer.renderTemplate("new-structure", model);
}

export const newStructureEmailRenderer = { renderTemplate };

import { Usager } from "../../_common/model";

export const getUsagerNomComplet = (
  usager: Pick<Usager, "nom" | "prenom" | "sexe">
): string => {
  return usager
    ? (usager.sexe === "homme" ? "M. " : "Mme ") +
        usager.prenom +
        " " +
        usager.nom.toUpperCase()
    : "";
};

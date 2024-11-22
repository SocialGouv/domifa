import { Usager } from "../interfaces";

export const getUsagerNomComplet = (
  usager: Pick<Usager, "nom" | "prenom" | "sexe">
): string => {
  const prefix = usager.sexe === "homme" ? "M. " : "Mme ";
  return usager ? `${prefix + usager.prenom} ${usager.nom.toUpperCase()}` : "";
};

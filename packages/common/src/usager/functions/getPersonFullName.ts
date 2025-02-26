import { UsagerSexe } from "../types";

type PersonBase = {
  nom: string;
  prenom: string;
  sexe?: UsagerSexe | null;
};

export const getPersonFullName = <T extends PersonBase>(person: T): string => {
  const hasSexe = "sexe" in person && person?.sexe;
  const prefix = hasSexe ? (person.sexe === "homme" ? "M. " : "Mme ") : "";

  return person ? `${prefix}${person.nom.toUpperCase()} ${person.prenom}` : "";
};

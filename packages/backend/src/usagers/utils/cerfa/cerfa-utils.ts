import { isNil } from "lodash";
import { Usager } from "@domifa/common";
import { DateCerfa } from "../../constants/cerfa";
import { getStringFromData } from "../../../util/functions";

export const getUsagerRef = (
  usager: Pick<Usager, "ref" | "customRef">
): string => {
  return !isNil(usager?.customRef)
    ? getStringFromData(usager.customRef)
    : usager.ref.toString();
};

export const resetDate = (): DateCerfa => {
  return { annee: "", heure: "", jour: "", minutes: "", mois: "" };
};

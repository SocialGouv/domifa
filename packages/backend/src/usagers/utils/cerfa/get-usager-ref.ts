import { isNil } from "lodash";
import { Usager } from "@domifa/common";
import { getStringFromData } from "../../../util/functions";

export const getUsagerRef = (
  usager: Pick<Usager, "ref" | "customRef">
): string => {
  return !isNil(usager?.customRef)
    ? getStringFromData(usager.customRef)
    : usager.ref.toString();
};

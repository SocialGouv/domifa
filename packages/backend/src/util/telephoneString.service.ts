import { Telephone } from "../_common/model/index";

export const telephoneString = (telephone: Telephone): string => {
  if (!telephone) {
    return "";
  }

  return `${telephone.indicatif}${telephone.numero}`;
};

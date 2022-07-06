import { COUNTRY_CODES, Telephone } from "../../_common/model/telephone";

export const getPhoneString = (telephone: Telephone): string => {
  return !telephone
    ? ""
    : telephone.numero !== null && telephone.numero !== ""
    ? `+${COUNTRY_CODES[telephone.countryCode]}${telephone.numero}`
    : "";
};

export const getIndicatif = (countryCode: string): string => {
  if (COUNTRY_CODES[countryCode] === undefined) return "+33";

  return `+${COUNTRY_CODES[countryCode]}`;
};

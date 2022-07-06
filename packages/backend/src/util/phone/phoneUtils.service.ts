import { COUNTRY_CODES, Telephone } from "../../_common/model/telephone";

export const getPhoneString = (telephone: Telephone): string => {
  if (!telephone) {
    return "";
  }
  if (telephone.numero === null || telephone.numero === "") {
    return "";
  }
  return `+${COUNTRY_CODES[telephone.countryCode]}${telephone.numero}`;
};

export const getCountryCode = (countryCode: string): string => {
  if (COUNTRY_CODES[countryCode] === undefined) return "+33";

  return `+${COUNTRY_CODES[countryCode]}`;
};

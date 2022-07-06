import { COUNTRY_CODES, Telephone } from "../../_common/model/telephone";

export const getPhoneString = (telephone: Telephone): string => {
  return !telephone
    ? ""
    : `+${COUNTRY_CODES[telephone.countryCode]}${telephone.numero
        .toString()
        .replace(/\s/g, "+")}`;
};

export const getCountryCode = (countryCode: string): string => {
  if (COUNTRY_CODES[countryCode] === undefined) return "+33";

  return `+${COUNTRY_CODES[countryCode]}`;
};

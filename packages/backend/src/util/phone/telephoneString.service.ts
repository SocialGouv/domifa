import { COUNTRY_CODES, Telephone } from "../../_common/model/telephone";

export const telephoneString = (telephone: Telephone): string => {
  return !telephone
    ? ""
    : `+${COUNTRY_CODES[telephone.countryCode]}${telephone.numero}`;
};

export const getIndicatif = (countryCode: string): string => {
  if (COUNTRY_CODES[countryCode] === undefined) return "+33";

  return `+${COUNTRY_CODES[countryCode]}`;
};

// HOTFIX en attendant qu'on intégre les countryCodes dans les usagers
export const telephoneFixCountryCode = (
  countryCode: string,
  phone: string
): string => {
  if (COUNTRY_CODES[countryCode] === undefined) {
    return "+33";
  }

  if (countryCode === "fr" && phone[0] === "0") {
    const newPhone = phone.substring(1, phone.length);
    return `${getIndicatif(countryCode)}${newPhone}`;
  }

  return `${getIndicatif(countryCode)}${phone}`;
};

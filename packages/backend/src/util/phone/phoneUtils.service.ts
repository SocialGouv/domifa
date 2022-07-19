import { COUNTRY_CODES, Telephone } from "../../_common/model/telephone";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

export const getPhoneString = (telephone: Telephone): string => {
  if (!telephone) {
    return "";
  }
  if (telephone.numero === null || telephone.numero === "") {
    return "";
  }
  const phoneUtil = PhoneNumberUtil.getInstance();
  const numero = phoneUtil.parse(
    telephone.numero,
    telephone.countryCode.toLowerCase()
  );
  return phoneUtil.format(numero, PhoneNumberFormat.INTERNATIONAL);
};

export const getCountryCode = (countryCode: string): string => {
  if (COUNTRY_CODES[countryCode] === undefined) {
    return "+33";
  }

  return `+${COUNTRY_CODES[countryCode]}`;
};

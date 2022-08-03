import { Telephone } from "../../_common/model/telephone";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
export const phoneUtil = PhoneNumberUtil.getInstance();

export const getPhoneString = (telephone: Telephone): string => {
  if (!telephone) {
    return "";
  }
  if (telephone.numero === null || telephone.numero === "") {
    return "";
  }

  const numero = phoneUtil.parse(
    telephone.numero,
    telephone.countryCode.toLowerCase()
  );
  return phoneUtil.format(numero, PhoneNumberFormat.INTERNATIONAL);
};

export const isValidMobilePhone = (value: Telephone): boolean | null => {
  if (!value) {
    return true;
  }
  if (!value.numero || value.numero === "") {
    return true;
  }
  try {
    const parsedValue = phoneUtil.parse(value.numero, value.countryCode);

    if (phoneUtil.isValidNumber(parsedValue)) {
      const numberType = phoneUtil.getNumberType(parsedValue);
      if (phoneUtil.getNumberType(parsedValue) !== 1) {
        const PHONES_CODES: any = {
          "0": "FIXED_LINE",
          "1": "MOBILE",
          "2": "FIXED_LINE_OR_MOBILE",
          "3": "TOLL_FREE",
          "4": "PREMIUM_RATE",
          "5": "SHARED_COST",
          "6": "VOIP",
          "7": "PERSONAL_NUMBER",
          "8": "PAGER",
          "9": "UAN",
          "10": "VOICEMAIL",
          "-1": "UNKNOWN",
        };
        console.log(PHONES_CODES[numberType.toString()] + " = " + numberType);
      }
      return numberType === 1 ? true : false;
    }
    // Numéro invalide
    return false;
  } catch (e) {
    console.log("Numéro érroné");
    return false;
  }
};

export const isAnyValidPhone = (value: Telephone): boolean => {
  if (!value) {
    return false;
  }
  if (!value.numero || value.numero === "") {
    return false;
  }
  try {
    const parsedValue = phoneUtil.parse(value.numero, value.countryCode);
    return phoneUtil.isValidNumber(parsedValue) ? true : false;
  } catch (e) {
    return false;
  }
};

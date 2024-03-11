import { Telephone } from "@domifa/common";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
export const phoneUtil = PhoneNumberUtil.getInstance();

export const getPhoneString = (
  telephone: Telephone,
  excpectedFormat: PhoneNumberFormat = PhoneNumberFormat.INTERNATIONAL
): string => {
  if (!telephone) {
    return "";
  }
  if (telephone.numero === null || telephone.numero === "") {
    return "";
  }

  const numero = phoneUtil.parse(
    telephone.numero,
    telephone?.countryCode?.toLowerCase()
  );
  return phoneUtil.format(numero, excpectedFormat);
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
      return numberType === 1 ? true : false;
    }
    // Numéro invalide
    return false;
  } catch (e) {
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

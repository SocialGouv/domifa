import { Telephone } from "@domifa/common";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
export const phoneUtil = PhoneNumberUtil.getInstance();

export const getPhoneString = (
  telephone: Telephone,
  excpectedFormat: PhoneNumberFormat = PhoneNumberFormat.NATIONAL
): string => {
  if (!telephone?.numero || telephone?.numero === "") {
    return "";
  }

  telephone.numero = telephone.numero.replace(/\D/g, "");

  const numero = phoneUtil.parse(
    telephone.numero,
    telephone?.countryCode?.toLowerCase()
  );
  if (phoneUtil.isValidNumber(numero)) {
    return phoneUtil.format(numero, excpectedFormat);
  }
  return "";
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
      return numberType === 1;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const isAnyValidPhone = (value: Telephone): boolean => {
  if (!value?.numero || value?.numero === "") {
    return false;
  }
  try {
    const parsedValue = phoneUtil.parse(value.numero, value.countryCode);
    return phoneUtil.isValidNumber(parsedValue);
  } catch (e) {
    return false;
  }
};

/* eslint-disable id-denylist */
import { PhoneNumberUtil } from "google-libphonenumber";
import { Telephone } from "../../../_common/model";
import { Iso2 } from "intl-tel-input/data";

export function getFormPhone(formValue: Telephone | null): Telephone {
  if (!formValue) {
    return {
      numero: "",
      countryCode: "fr" as Iso2,
    };
  }
  return {
    numero: formValue?.numero ? formValue?.numero.replace(/\D/g, "") : "",
    countryCode: formValue?.countryCode
      ? (formValue?.countryCode.toLowerCase() as Iso2)
      : ("fr" as Iso2),
  };
}

export function setFormPhone(telephone: Telephone): Telephone {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const defaultReturn: Telephone = {
    numero: "",
    countryCode: telephone.countryCode,
  };
  try {
    const parsedPhone = phoneUtil.parse(
      telephone.numero,
      telephone.countryCode
    );
    if (!phoneUtil.isValidNumber(parsedPhone) || !parsedPhone) {
      return defaultReturn;
    }
    return {
      numero: parsedPhone.getNationalNumber()?.toString() || "",
      countryCode: telephone.countryCode,
    };
  } catch (e) {
    return defaultReturn;
  }
}

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

import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";
import { Telephone } from "../../../_common/model";

const phoneUtil = PhoneNumberUtil.getInstance();

export const formatInternationalPhoneNumber = (
  phone?: Telephone
): string | null => {
  if (!phone?.numero || !phone?.countryCode) {
    return null;
  }

  try {
    const numero = phoneUtil.parse(
      phone.numero,
      phone.countryCode.toLowerCase()
    );
    if (!phoneUtil.isValidNumber(numero) || !numero) {
      return null;
    }
    const phoneFormat =
      phone.countryCode.toLowerCase() === "fr"
        ? PhoneNumberFormat.NATIONAL
        : PhoneNumberFormat.INTERNATIONAL;

    return phoneUtil.format(numero, phoneFormat);
  } catch (error) {
    return null;
  }
};

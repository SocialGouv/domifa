import * as lpn from "google-libphonenumber";

import { Telephone } from "../_common/model/index";
import { appLogger } from "./AppLogger.service";

export const formatInternationalPhoneNumber = (
  telephone: Telephone
): string => {
  if (!telephone) return "";
  else if (!telephone?.numero) return "";
  else if (!telephone?.indicatif) return "";

  const phoneUtil = lpn.PhoneNumberUtil.getInstance();

  try {
    const number = phoneUtil.parse(
      telephone.numero,
      telephone.indicatif.toUpperCase()
    );
    const internationalPhone = phoneUtil.format(
      number,
      lpn.PhoneNumberFormat.INTERNATIONAL
    );
    return internationalPhone;
  } catch (error) {
    appLogger.error("Error format international phone number", {
      error: error as any,
      sentry: true,
    });
    return "";
  }
};

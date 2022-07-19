import { Pipe, PipeTransform } from "@angular/core";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

import { Telephone } from "../../../../_common/model";

@Pipe({ name: "formatInternationalPhoneNumber" })
export class FormatInternationalPhoneNumberPipe implements PipeTransform {
  transform(telephone: Telephone): string {
    const phoneUtil = PhoneNumberUtil.getInstance();
    if (!telephone) {
      return "Non renseigné";
    }

    if (telephone?.numero === "" || !telephone?.countryCode) {
      return "Non renseigné";
    }

    try {
      const numero = phoneUtil.parse(
        telephone.numero,
        telephone.countryCode.toLowerCase()
      );
      return phoneUtil.format(numero, PhoneNumberFormat.INTERNATIONAL);
    } catch (error) {
      console.warn(error);
      return "Numéro introuvable";
    }
  }
}

import { Pipe, PipeTransform } from "@angular/core";
import { PhoneNumberFormat } from "google-libphonenumber";

import { Telephone } from "../../../../_common/model";
import { phoneUtil } from "../../../shared";

@Pipe({ name: "formatInternationalPhoneNumber" })
export class FormatInternationalPhoneNumberPipe implements PipeTransform {
  transform(telephone: Telephone): string {
    if (!telephone) {
      return "Non renseigné";
    }

    if (
      telephone?.numero === "" ||
      !telephone?.numero ||
      !telephone?.countryCode
    ) {
      return "Non renseigné";
    }

    try {
      const numero = phoneUtil.parse(
        telephone.numero,
        telephone.countryCode.toLowerCase()
      );
      if (!phoneUtil.isValidNumber(numero) || !numero) {
        return "Non renseigné";
      }
      return phoneUtil.format(numero, PhoneNumberFormat.INTERNATIONAL);
    } catch (error) {
      return "Numéro introuvable";
    }
  }
}

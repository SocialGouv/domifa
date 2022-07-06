import { Pipe, PipeTransform } from "@angular/core";
import * as lpn from "google-libphonenumber";

import { Telephone } from "../../../../_common/";

@Pipe({ name: "formatInternationalPhoneNumber" })
export class FormatInternationalPhoneNumberPipe implements PipeTransform {
  phoneUtil: any = lpn.PhoneNumberUtil.getInstance();

  transform(telephone: Telephone): string {
    if (!telephone) {
      return "Non renseigné";
    } else if (!telephone?.numero) {
      return "Non renseigné";
    } else if (!telephone?.countryCode) {
      return "Indicatif non renseigné";
    }

    try {
      const numero = this.phoneUtil.parse(
        telephone.numero,
        telephone.countryCode.toUpperCase(),
      );
      const internationalPhone = this.phoneUtil.format(
        numero,
        lpn.PhoneNumberFormat.INTERNATIONAL,
      );
      return internationalPhone;
    } catch (error) {
      console.warn(error);
      return "Numéro introuvable";
    }
  }
}

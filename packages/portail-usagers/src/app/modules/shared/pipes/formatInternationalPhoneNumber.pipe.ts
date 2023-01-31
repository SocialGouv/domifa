import { Pipe, PipeTransform } from "@angular/core";
import * as lpn from "google-libphonenumber";

import { Telephone } from "../../../../_common/";

@Pipe({ name: "formatInternationalPhoneNumber" })
export class FormatInternationalPhoneNumberPipe implements PipeTransform {
  public phoneUtil: lpn.PhoneNumberUtil = lpn.PhoneNumberUtil.getInstance();

  transform(telephone: Telephone): string {
    if (!telephone?.numero || !telephone?.countryCode) {
      return "Téléphone non renseigné";
    }
    try {
      const numero = this.phoneUtil.parse(
        telephone.numero,
        telephone.countryCode.toUpperCase(),
      );
      return this.phoneUtil.format(numero, lpn.PhoneNumberFormat.INTERNATIONAL);
    } catch (error) {
      console.warn(error);
      return "Non renseigné";
    }
  }
}

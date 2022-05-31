import { Pipe, PipeTransform } from "@angular/core";
import * as lpn from "google-libphonenumber";

import { Telephone } from "../../../../_common/";

@Pipe({ name: "formatInternationalPhoneNumber" })
export class FormatInternationalPhoneNumberPipe implements PipeTransform {
  phoneUtil: any = lpn.PhoneNumberUtil.getInstance();

  transform(telephone: Telephone): string {
    if (!telephone) return "Non renseigné";
    else if (!telephone?.numero) return "Non renseigné";
    else if (!telephone?.indicatif) return "Indicatif non renseigné";

    try {
      const number = this.phoneUtil.parse(
        telephone.numero,
        telephone.indicatif.toUpperCase()
      );
      const internationalPhone = this.phoneUtil.format(
        number,
        lpn.PhoneNumberFormat.INTERNATIONAL
      );
      return internationalPhone;
    } catch (error) {
      console.warn(error);
      return "Numéro introuvable";
    }
  }
}

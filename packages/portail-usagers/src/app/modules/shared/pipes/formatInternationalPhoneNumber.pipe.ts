import { Pipe, PipeTransform } from "@angular/core";
import { Telephone } from "@domifa/common";
import * as lpn from "google-libphonenumber";

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

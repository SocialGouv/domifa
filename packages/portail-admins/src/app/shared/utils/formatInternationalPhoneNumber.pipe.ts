import { Pipe, PipeTransform } from "@angular/core";
import { Telephone } from "@domifa/common";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

@Pipe({ name: "formatInternationalPhoneNumber", standalone: true })
export class FormatInternationalPhoneNumberPipe implements PipeTransform {
  public transform(telephone: Telephone): string {
    const phoneUtil = PhoneNumberUtil.getInstance();
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

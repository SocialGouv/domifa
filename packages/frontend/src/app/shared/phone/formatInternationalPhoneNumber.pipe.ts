import { Pipe, PipeTransform } from "@angular/core";
import { Telephone } from "../../../_common/model";
import { formatInternationalPhoneNumber } from "./formatInternationalPhoneNumber";

@Pipe({ name: "formatInternationalPhoneNumber", standalone: true })
export class FormatInternationalPhoneNumberPipe implements PipeTransform {
  public transform(telephone: Telephone): string {
    return formatInternationalPhoneNumber(telephone) || "Non renseigné";
  }
}

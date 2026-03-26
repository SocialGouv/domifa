import { Pipe, PipeTransform } from "@angular/core";
import { LANGUAGES_MAP } from "../utils/languages";

@Pipe({
  name: "languageLabel",
})
export class LanguageLabelPipe implements PipeTransform {
  transform(isoCode: string | null): string {
    if (!isoCode) {
      return "";
    }
    return LANGUAGES_MAP[isoCode]?.label ?? isoCode;
  }
}

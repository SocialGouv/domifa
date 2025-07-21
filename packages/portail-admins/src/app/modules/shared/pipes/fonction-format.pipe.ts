import { Pipe, PipeTransform } from "@angular/core";
import {
  USER_FONCTION_LABELS,
  UserFonction,
  UserStructure,
} from "@domifa/common";

@Pipe({
  name: "fonctionFormat",
  standalone: true,
})
export class FonctionFormatPipe implements PipeTransform {
  transform(user: UserStructure | null | undefined): string {
    if (!user || !user.fonction) {
      return "Non renseignée";
    }
    if (user.fonction !== UserFonction.AUTRE) {
      return USER_FONCTION_LABELS[user.fonction];
    }
    if (user.fonctionDetail) {
      return `${USER_FONCTION_LABELS[user.fonction]} : ${user.fonctionDetail}`;
    }
    return USER_FONCTION_LABELS[user.fonction];
  }
}

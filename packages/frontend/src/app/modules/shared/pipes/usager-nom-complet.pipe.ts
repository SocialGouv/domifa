import { Pipe, PipeTransform } from "@angular/core";

import { getUsagerNomComplet } from "../../../shared/getUsagerNomComplet";
import { Usager } from "@domifa/common";

@Pipe({ name: "usagerNomComplet" })
export class UsagerNomCompletPipe implements PipeTransform {
  public transform(usager: Pick<Usager, "nom" | "prenom" | "sexe">): string {
    return getUsagerNomComplet(usager);
  }
}

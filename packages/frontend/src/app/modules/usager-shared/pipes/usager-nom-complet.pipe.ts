import { Pipe, PipeTransform } from "@angular/core";
import { Usager, getUsagerNomComplet } from "@domifa/common";

@Pipe({ name: "usagerNomComplet", standalone: true })
export class UsagerNomCompletPipe implements PipeTransform {
  public transform(usager: Pick<Usager, "nom" | "prenom" | "sexe">): string {
    return getUsagerNomComplet(usager);
  }
}

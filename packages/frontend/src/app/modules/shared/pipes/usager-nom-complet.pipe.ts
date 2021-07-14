import { Pipe, PipeTransform } from "@angular/core";
import { Usager } from "../../../../_common/model";

@Pipe({ name: "usagerNomComplet" })
export class UsagerNomCompletPipe implements PipeTransform {
  transform(usager: Pick<Usager, "nom" | "prenom" | "sexe">): any {
    const nomComplet = usager
      ? (usager.sexe === "homme" ? "M. " : "Mme ") +
        usager.prenom +
        " " +
        usager.nom.toUpperCase()
      : "";
    return nomComplet;
  }
}

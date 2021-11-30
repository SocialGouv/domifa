import { Pipe, PipeTransform } from "@angular/core";
import { PortailUsagerPublic } from "../../../../_common";
@Pipe({ name: "usagerNomComplet" })
export class UsagerNomCompletPipe implements PipeTransform {
  transform(usager: Pick<PortailUsagerPublic, "nom" | "prenom" | "sexe">): any {
    const nomComplet = usager
      ? (usager.sexe === "homme" ? "M. " : "Mme ") +
        usager.prenom +
        " " +
        usager.nom.toUpperCase()
      : "";
    return nomComplet;
  }
}

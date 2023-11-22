import { Pipe, PipeTransform } from "@angular/core";
import { PortailUsagerPublic } from "@domifa/common";

@Pipe({ name: "usagerNomComplet" })
export class UsagerNomCompletPipe implements PipeTransform {
  transform(
    usager: Pick<PortailUsagerPublic, "nom" | "prenom" | "sexe">,
  ): string {
    const prefix = usager.sexe === "homme" ? "M. " : "Mme ";
    return usager
      ? prefix + usager.prenom + " " + usager.nom.toUpperCase()
      : "";
  }
}

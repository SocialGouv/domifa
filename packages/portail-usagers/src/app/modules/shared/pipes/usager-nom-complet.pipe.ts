import { Pipe, PipeTransform } from "@angular/core";
// import { Usager } from "../../../../_common/model";

// TODO: fix it après avoir recréer les bons types
export type UsagerTemp = {
  nom: string;
  prenom: string;
  sexe: string;
};
@Pipe({ name: "usagerNomComplet" })
export class UsagerNomCompletPipe implements PipeTransform {
  transform(usager: Pick<UsagerTemp, "nom" | "prenom" | "sexe">): any {
    const nomComplet = usager
      ? (usager.sexe === "homme" ? "M. " : "Mme ") +
        usager.prenom +
        " " +
        usager.nom.toUpperCase()
      : "";
    return nomComplet;
  }
}

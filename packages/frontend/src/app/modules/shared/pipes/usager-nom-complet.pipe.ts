import { Pipe, PipeTransform } from "@angular/core";
import { Usager } from "../../../../_common/model";
import { getUsagerNomComplet } from "../../../shared/getUsagerNomComplet";

@Pipe({ name: "usagerNomComplet" })
export class UsagerNomCompletPipe implements PipeTransform {
  transform(usager: Pick<Usager, "nom" | "prenom" | "sexe">): string {
    return getUsagerNomComplet(usager);
  }
}

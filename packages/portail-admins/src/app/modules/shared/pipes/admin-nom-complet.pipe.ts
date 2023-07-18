import { Pipe, PipeTransform } from "@angular/core";
import { PortailAdminUser } from "../../../../_common";

@Pipe({ name: "adminNomComplet" })
export class AdminNomCompletPipe implements PipeTransform {
  transform(admin: Pick<PortailAdminUser, "nom" | "prenom">): any {
    return admin ? admin.prenom + " " + admin.nom.toUpperCase() : "";
  }
}

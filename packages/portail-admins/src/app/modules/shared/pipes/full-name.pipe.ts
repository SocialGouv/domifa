import { Pipe, PipeTransform } from "@angular/core";
import { getPersonFullName, UsagerSexe } from "@domifa/common";

type PersonBase = {
  nom: string;
  prenom: string;
  sexe?: UsagerSexe | null;
};
@Pipe({ name: "fullName", standalone: true })
export class FullNamePipe implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public transform(usager: PersonBase): string {
    return getPersonFullName(usager);
  }
}

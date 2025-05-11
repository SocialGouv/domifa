import { Usager, UsagerAyantDroit } from "@domifa/common";
import { format } from "date-fns";

export function getAyantsDroit(usager: Usager): string {
  let content = "";

  if (usager.ayantsDroits.length > 0) {
    content = usager.ayantsDroits.reduce(
      (prev: string, current: UsagerAyantDroit) =>
        `${prev}${current.nom} ${current.prenom} né(e) le ${format(
          new Date(current.dateNaissance),
          "dd/MM/yyyy"
        )} - `,
      ""
    );

    if (content) {
      content = content.substring(0, content.length - 2).trim();
    }
  }
  return content;
}

import { IsBoolean, IsUUID } from "class-validator";

export class LinkUsagerDto {
  @IsUUID()
  public targetUsagerUuid!: string;

  // true si la liaison provient d'un clic sur la suggestion de matching
  // automatique, false si elle provient de la recherche manuelle — utilisé
  // uniquement pour le log applicatif (mesure d'adoption).
  @IsBoolean()
  public acceptedSuggestion!: boolean;
}

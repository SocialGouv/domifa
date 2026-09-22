import { IsBoolean, IsUUID } from "class-validator";

export class LinkUsagerDto {
  @IsUUID()
  public targetUsagerUuid!: string;

  // true when the link comes from clicking the automatic matching
  // suggestion, false when it comes from the manual search — only used
  // for the application log (adoption measurement).
  @IsBoolean()
  public acceptedSuggestion!: boolean;
}

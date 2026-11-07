import { IsUUID } from "class-validator";

export class RejectSuggestionDto {
  @IsUUID()
  public ayantDroitUuid!: string;
}

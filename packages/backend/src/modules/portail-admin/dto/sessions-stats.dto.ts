import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

// Forme de la réponse partagée via @domifa/common (utilisée côté portails).
// On la ré-exporte ici pour que les controllers du backend la consomment
// par le même chemin que le query DTO.
export { SessionsStats } from "@domifa/common";

export class SessionsStatsQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    description: "Restreint l'agrégat à une structure. Omis = vue plateforme.",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly structureId?: number;
}

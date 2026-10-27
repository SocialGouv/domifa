import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from "@nestjs/common";
import { ETAPE_DOSSIER_COMPLET, ETAPE_ETAT_CIVIL } from "@domifa/common";
import { parseStrictInt } from "./ParseStrictInt.pipe";

export function parseEtapeDemande(value: unknown): number | null {
  return parseStrictInt(value, {
    min: ETAPE_ETAT_CIVIL,
    max: ETAPE_DOSSIER_COMPLET,
  });
}

// Custom decorator, not a pipe: see ParseStrictInt.pipe
export const EtapeDemandeParam = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const etape = parseEtapeDemande(
      context.switchToHttp().getRequest().params?.etapeDemande
    );
    if (etape === null) {
      throw new BadRequestException("ETAPE_DEMANDE_INVALID");
    }
    return etape;
  }
);

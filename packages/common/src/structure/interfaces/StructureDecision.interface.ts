import {
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
} from "../enums";
import { StructureDecisionStatut } from "../types";

export interface StructureDecision {
  uuid: string;
  dateDecision: Date; // Now()
  statut: StructureDecisionStatut;
  motif?:
    | StructureDecisionRefusMotif
    | StructureDecisionSuppressionMotif
    | null;
  motifDetails?: string;
  userId: number;
  userName: string;
}

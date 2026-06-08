import { EntityDecision } from "../../_core";
import {
  StructureDecisionRefusMotif,
  StructureDecisionSuppressionMotif,
} from "../enums";
import { StructureDecisionStatut } from "../types";

export type StructureDecision = EntityDecision<
  StructureDecisionStatut,
  StructureDecisionRefusMotif | StructureDecisionSuppressionMotif
>;

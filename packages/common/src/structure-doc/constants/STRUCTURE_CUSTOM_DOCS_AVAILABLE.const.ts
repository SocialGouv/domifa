import { StructureDocTypesAvailable } from "../enums";
import { StructureCustomDocType } from "../types";

export const DEFAULT_STRUCTURE_CUSTOM_DOC_AVAILABLE: StructureCustomDocType[] =
  [
    StructureDocTypesAvailable.attestation_postale,
    StructureDocTypesAvailable.cerfa_attestation,
    StructureDocTypesAvailable.courrier_radiation,
  ];

export const STRUCTURE_CUSTOM_DOC_AVAILABLE: StructureCustomDocType[] = [
  ...DEFAULT_STRUCTURE_CUSTOM_DOC_AVAILABLE,
  "autre",
];

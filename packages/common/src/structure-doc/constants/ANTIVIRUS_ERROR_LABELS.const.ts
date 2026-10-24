import { AntivirusErrorCode } from "../types";

export const ANTIVIRUS_ERROR_LABELS: Record<AntivirusErrorCode, string> = {
  FILE_INFECTED:
    "Le fichier a été bloqué par l'antivirus : il contient un virus ou un contenu malveillant.",
  ANTIVIRUS_UNAVAILABLE:
    "L'analyse antivirus est temporairement indisponible. Merci de réessayer dans quelques minutes.",
};

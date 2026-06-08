// Resolves the French label for a decision motif. Returns "" when there is
// no motif (e.g. a non-final status like EN_ATTENTE / PENDING). Callers pass
// the labels record specific to their entity + statut pair.
export function getEntityDecisionMotifLabel<TMotif extends string>(
  motif: TMotif | null | undefined,
  labels: Partial<Record<TMotif, string>>
): string {
  if (!motif) {
    return "";
  }
  return labels[motif] ?? "";
}

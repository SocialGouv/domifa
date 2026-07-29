export const CGU_LAST_UPDATE_DATE = new Date("2026-07-29T00:00:00Z");

export const hasAcceptedCurrentCgu = (
  acceptTerms: Date | string | null | undefined
): boolean => {
  if (!acceptTerms) {
    return false;
  }
  const acceptedAt = new Date(acceptTerms).getTime();
  if (Number.isNaN(acceptedAt)) {
    return false;
  }
  return acceptedAt >= CGU_LAST_UPDATE_DATE.getTime();
};

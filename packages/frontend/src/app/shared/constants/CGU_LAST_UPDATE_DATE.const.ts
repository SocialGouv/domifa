export const CGU_LAST_UPDATE_DATE = new Date("2026-07-29");

export const hasAcceptedCurrentCgu = (
  acceptTerms: Date | string | null | undefined
): boolean => {
  if (!acceptTerms) {
    return false;
  }
  return new Date(acceptTerms).getTime() >= CGU_LAST_UPDATE_DATE.getTime();
};

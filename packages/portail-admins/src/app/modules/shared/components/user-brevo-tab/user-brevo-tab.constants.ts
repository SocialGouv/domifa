import { BrevoEmailEventType } from "@domifa/common";

export const BREVO_TAB_PAGE_SIZE = 50;

// Maps Brevo event types to DSFR badge severity. Used to color rows in the
// events table without leaking presentation knowledge into the @domifa/common
// package.
export const BREVO_SUCCESS_EVENTS: readonly BrevoEmailEventType[] = [
  "delivered",
  "opened",
  "clicks",
] as const;

export const BREVO_ERROR_EVENTS: readonly BrevoEmailEventType[] = [
  "bounces",
  "hardBounces",
  "spam",
  "invalid",
  "blocked",
  "error",
] as const;

export const BREVO_WARNING_EVENTS: readonly BrevoEmailEventType[] = [
  "softBounces",
  "deferred",
  "unsubscribed",
  "loadedByProxy",
] as const;

export function brevoEventBadgeClass(event: BrevoEmailEventType): string {
  if (BREVO_SUCCESS_EVENTS.includes(event)) {
    return "fr-badge fr-badge--success fr-badge--sm";
  }
  if (BREVO_ERROR_EVENTS.includes(event)) {
    return "fr-badge fr-badge--error fr-badge--sm";
  }
  if (BREVO_WARNING_EVENTS.includes(event)) {
    return "fr-badge fr-badge--warning fr-badge--sm";
  }
  return "fr-badge fr-badge--info fr-badge--sm";
}

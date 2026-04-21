/**
 * Utilitaires de conversion de dates pour les composants DSFR datepicker.
 * Remplace les fonctions de bootstrap-util.ts (NgbDateStruct) par des fonctions ISO string.
 *
 * Convention : toutes les dates manipulées sont normalisées à UTC midi (12:00:00Z)
 * pour éviter les décalages de timezone (Guyane UTC-3, Réunion UTC+4, métropole UTC+1/+2).
 */
import { isValid, parse } from "date-fns";

export const FR_DATE_FORMAT = "dd/MM/yyyy";

/**
 * Normalise une date (locale ou UTC) vers UTC midi.
 * Utilise les composants LOCAUX du Date pour garantir le bon jour
 * quelque soit la timezone (contrairement à toNoon de bootstrap-util qui utilise les getters UTC).
 */
export function toUtcNoon(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
  );
}

/**
 * Parse dd/MM/yyyy → Date UTC noon. Retourne null si invalide.
 */
export function parseFrDate(value: string): Date | null {
  if (!value) {
    return null;
  }
  const parsed = parse(value, FR_DATE_FORMAT, new Date());
  if (!isValid(parsed)) {
    return null;
  }
  return toUtcNoon(parsed);
}

/**
 * Date minimale de naissance au format ISO (YYYY-MM-DD) pour [min] du datepicker DSFR.
 */
export const MIN_DATE_NAISSANCE = "1900-01-01";

/**
 * Date/string → dd/MM/yyyy (UTC).
 * La date en entrée DOIT être en UTC midi (via parseFrDate, toUtcNoon, ou API).
 */
export function formatDateToFr(date: Date | string | null): string {
  if (!date) {
    return "";
  }
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${dateObj.getUTCFullYear()}`;
}

/**
 * Retourne la date du jour au format dd/MM/yyyy (date locale de l'utilisateur).
 */
export function getTodayFr(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${now.getFullYear()}`;
}

/**
 * Date/string → YYYY-MM-DD (UTC).
 * La date en entrée DOIT être en UTC midi (via parseFrDate, toUtcNoon, ou API).
 * Pour les props [min]/[max] du datepicker DSFR.
 */
export function formatDateToIso(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse YYYY-MM-DD → Date UTC noon.
 */
export function parseDateFromIso(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/**
 * Retourne la date du jour au format ISO YYYY-MM-DD (date locale de l'utilisateur).
 */
export function getTodayIso(): string {
  return formatDateToIso(toUtcNoon(new Date()));
}

/**
 * Retourne une date future (aujourd'hui + yearsAhead) au format ISO YYYY-MM-DD.
 */
export function getMaxDateIso(yearsAhead: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + yearsAhead);
  return formatDateToIso(toUtcNoon(d));
}

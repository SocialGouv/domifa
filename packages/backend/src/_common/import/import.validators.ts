import moment = require("moment");

export function notEmpty(value: string): boolean {
  return typeof value !== "undefined" && value !== null && value.trim() !== "";
}

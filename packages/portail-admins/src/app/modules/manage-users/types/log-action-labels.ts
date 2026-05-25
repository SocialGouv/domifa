import { LOG_ACTION_LABELS } from "@domifa/common";

export { LOG_ACTION_LABELS };

// Implemented locally instead of re-exporting from @domifa/common: esbuild's
// CJS interop reliably surfaces named *value* imports (the LABELS object), but
// `export { ... } from "..."` re-exports of *function* bindings end up
// undefined inside lazy chunks here.
export function getLogActionLabel(action: string): string {
  return LOG_ACTION_LABELS[action as keyof typeof LOG_ACTION_LABELS] ?? action;
}

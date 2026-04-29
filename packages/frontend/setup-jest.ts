import { setupZoneTestEnv } from "jest-preset-angular/setup-env/zone";
setupZoneTestEnv();

if (typeof globalThis.structuredClone === "undefined") {
  globalThis.structuredClone = <T>(val: T): T =>
    JSON.parse(JSON.stringify(val));
}

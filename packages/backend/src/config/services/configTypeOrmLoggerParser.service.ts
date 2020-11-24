import { LoggerOptions } from "typeorm/logger/LoggerOptions";
import { DomifaEnv, DomifaEnvKey } from "../model";
import { configParser } from "./configParser.service";

export const configTypeOrmLoggerParser = {
  getTypeormLoggerOptions,
};

type LoggerOptionValues =
  | "query"
  | "schema"
  | "error"
  | "warn"
  | "info"
  | "log"
  | "migration"; // @see typeorm LoggerOption
const LOGGER_OPTIONS: LoggerOptionValues[] = [
  "query",
  "schema",
  "error",
  "warn",
  "info",
  "log",
  "migration",
];
function getTypeormLoggerOptions(
  envConfig: Partial<DomifaEnv>,
  key: DomifaEnvKey
): LoggerOptions {
  const value = configParser.parseString(envConfig, key, {
    defaultValue: "false",
  });
  if (value) {
    if (value.trim() === "all") {
      return "all";
    }
    if (value.trim() === "true") {
      return true;
    }
    if (value.trim() === "false") {
      return false;
    }
    const values = value
      .split(",")
      .map((x) => x.trim())
      .reduce((acc, x) => {
        if (x) {
          if (LOGGER_OPTIONS.includes(x as LoggerOptionValues)) {
            acc.push(x as LoggerOptionValues);
          } else {
            // tslint:disable-next-line: no-console
            console.warn(
              `[appTypeormManager] Invalid typeorm logger option "${x}", @see LoggerOptions`
            );
            throw new Error("Invalid typeorm logger option");
          }
        }
        return acc;
      }, [] as LoggerOptionValues[]);
    return values;
  }
  return ["warn"]; // default
}

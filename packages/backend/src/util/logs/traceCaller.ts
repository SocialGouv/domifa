// Adapted from library pino-caller to customize
import "source-map-support/register";
import { symbols, Logger } from "pino";

const NODEJS_VERSION = parseInt(process.version.slice(1).split(".")[0], 10);
const STACKTRACE_OFFSET = NODEJS_VERSION && NODEJS_VERSION > 6 ? 0 : 1;
const LINE_OFFSET = 7;

const { asJsonSym } = symbols;

function traceCaller(
  pinoInstance: Logger,
  options: any = { relativeTo: null }
) {
  function get(target: any, name: any) {
    return name === asJsonSym ? asJson : target[name];
  }

  function asJson(...args: any[]) {
    args[0] = args[0] || Object.create(null);
    args[0].caller = Error()
      .stack.split("\n")
      .slice(2)
      .filter(
        (s) =>
          !s.includes("node_modules/pino") &&
          !s.includes("node_modules\\pino") &&
          !s.includes("node_modules/@opentelemetry") &&
          !s.includes("AppLogger.service.ts") &&
          !s.includes("node_modules/@nestjs/common/services/logger.service.js")
      )
      [STACKTRACE_OFFSET].substring(LINE_OFFSET);
    if (options && typeof options.relativeTo === "string") {
      args[0].caller = args[0].caller
        .replace(options.relativeTo + "/", "")
        .replace(options.relativeTo + "\\", "");
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return pinoInstance[asJsonSym].apply(this, args);
  }

  return new Proxy(pinoInstance, { get });
}

export default traceCaller;

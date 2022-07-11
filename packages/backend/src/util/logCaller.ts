// Adapted from library pino-caller to customize
import "source-map-support/register";

const NODEJS_VERSION = parseInt(process.version.slice(1).split(".")[0], 10);
const STACKTRACE_OFFSET = NODEJS_VERSION && NODEJS_VERSION > 6 ? 0 : 1;
const LINE_OFFSET = 7;
const { symbols } = require("pino");
const { asJsonSym } = symbols;

function traceCaller(pinoInstance, options = { relativeTo: null }) {
  function get(target, name) {
    return name === asJsonSym ? asJson : target[name];
  }

  function asJson(...args) {
    args[0] = args[0] || Object.create(null);
    args[0].caller = Error()
      .stack.split("\n")
      .slice(2)
      .filter(
        (s) =>
          !s.includes("node_modules/pino") &&
          !s.includes("node_modules\\pino") &&
          !s.includes("AppLogger.service.ts") &&
          !s.includes("node_modules/@nestjs/common/services/logger.service.js")
      )
      [STACKTRACE_OFFSET].substr(LINE_OFFSET);
    if (options && typeof options.relativeTo === "string") {
      args[0].caller = args[0].caller
        .replace(options.relativeTo + "/", "")
        .replace(options.relativeTo + "\\", "");
    }
    // @ts-ignore
    return pinoInstance[asJsonSym].apply(this, args);
  }

  return new Proxy(pinoInstance, { get });
}

export default traceCaller;

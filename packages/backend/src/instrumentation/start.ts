import APM = require("elastic-apm-node");
import { domifaConfig } from "../config";

let options: APM.AgentConfigOptions = {
  active: false,
};

if (domifaConfig) {
  options = {
    ...domifaConfig().apm,
  };

  options.captureBody = domifaConfig().envId !== "test" ? "all" : "off";
  options.errorOnAbortedRequests = true;
  options.abortedErrorThreshold = "60s";
}

const apm: APM.Agent = APM.start(options);
export { apm };

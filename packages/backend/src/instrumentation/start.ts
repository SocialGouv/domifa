import * as apmAgent from "elastic-apm-node";
import { domifaConfig } from "../config";

const options: apmAgent.AgentConfigOptions = {
  ...domifaConfig().apm,
};

options.captureBody = domifaConfig().envId !== "test" ? "all" : "off";
options.errorOnAbortedRequests = true;
options.abortedErrorThreshold = "60s";

const apm: apmAgent.Agent = apmAgent.start(options);
export { apm };

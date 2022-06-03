import * as apmAgent from 'elastic-apm-node';
import { domifaConfig } from "../config";

const options: apmAgent.AgentConfigOptions = {
  ...domifaConfig().apm
};

options.captureBody = "all";
options.errorOnAbortedRequests = true;
options.abortedErrorThreshold = "60s";

console.log("=> Starting APM");
const apm: apmAgent.Agent = apmAgent.start(options);
export { apm };

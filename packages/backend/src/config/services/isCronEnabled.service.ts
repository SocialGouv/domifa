import { domifaConfig } from "../domifaConfig.service";

export function isCronEnabled() {
  if (
    domifaConfig().cron.enable &&
    domifaConfig().envId !== "backend-cron" &&
    domifaConfig().envId !== "local"
  ) {
    return true;
  }
  return false;
}

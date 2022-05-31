import { domifaConfig } from "../domifaConfig.service";

export function isCronEnabled(): boolean {
  // return domifaConfig().cron.enable && domifaConfig().envId !== "local";
  return domifaConfig().cron.enable;
}

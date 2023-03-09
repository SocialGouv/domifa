import { domifaConfig } from "../domifaConfig.service";

export function isCronEnabled(): boolean {
  return domifaConfig().cron.enable;
}

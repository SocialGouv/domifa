import { domifaConfig } from "../../../config";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";

export const EXECUTE_MIGRATIONS =
  ((domifaConfig().envId === "preprod" || domifaConfig().envId === "prod") &&
    isCronEnabled()) ||
  domifaConfig().envId === "local";

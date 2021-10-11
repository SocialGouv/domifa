import { PortailUsagerUsager } from "../../../_common/model";
import { UsagerTable } from "../../entities";
import { pgRepository } from "../_postgres";
import { USAGER_LIGHT_ATTRIBUTES } from "./USAGER_LIGHT_ATTRIBUTES.const";
import { USAGER_PORTAIL_ATTRIBUTES } from "./USAGER_PORTAIL_ATTRIBUTES.const";

const baseRepository = pgRepository.get<UsagerTable, PortailUsagerUsager>(
  UsagerTable,
  {
    defaultSelect: USAGER_LIGHT_ATTRIBUTES,
  }
);

export const usagerPortailRepository = {
  ...baseRepository,
};

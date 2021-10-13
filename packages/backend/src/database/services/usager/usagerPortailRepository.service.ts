import { PortailUsagerUsager } from "../../../_common/model";
import { UsagerTable } from "../../entities";
import { pgRepository } from "../_postgres";
import { USAGER_PORTAIL_ATTRIBUTES } from "./USAGER_PORTAIL_ATTRIBUTES.const";

const baseRepository = pgRepository.get<UsagerTable, PortailUsagerUsager>(
  UsagerTable,
  {
    defaultSelect: USAGER_PORTAIL_ATTRIBUTES,
  }
);

export const usagerPortailRepository = {
  ...baseRepository,
};

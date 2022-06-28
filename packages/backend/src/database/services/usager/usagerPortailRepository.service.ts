import { PortailUsagerUsager } from "../../../_common/model";
import { UsagerTable } from "../../entities";
import { pgRepository } from "../_postgres";
import { USAGER_LIGHT_ATTRIBUTES } from "./constants";

const baseRepository = pgRepository.get<UsagerTable, PortailUsagerUsager>(
  UsagerTable,
  {
    defaultSelect: USAGER_LIGHT_ATTRIBUTES,
  }
);

export const usagerPortailRepository = {
  ...baseRepository,
};

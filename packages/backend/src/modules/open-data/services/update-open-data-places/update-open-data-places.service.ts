import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { loadDomifaData } from "../import-data/load-domifa";
import { loadSoliguideData } from "../import-data/load-soliguide";

@Injectable()
export class UpdateOpenDataPlacesService {
  @Cron("0 22 * * *", {
    timeZone: "Europe/Paris",
    disabled: domifaConfig().envId !== "prod" && isCronEnabled(),
  })
  protected async loadOpenDataPlaces() {
    await loadDomifaData();
    await loadSoliguideData();
  }
}

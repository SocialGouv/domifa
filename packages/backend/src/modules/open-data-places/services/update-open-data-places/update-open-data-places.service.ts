import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { loadDomifaData } from "../import-data/load-domifa";
import { loadMssData } from "../import-data/load-mss";
import { loadSoliguideData } from "../import-data/load-soliguide";

@Injectable()
export class UpdateOpenDataPlacesService implements OnModuleInit {
  async onModuleInit() {
    if (domifaConfig().envId === "prod" && isCronEnabled()) {
      await this.loadOpenDataPlaces();
    }
  }

  @Cron("0 6 * * *", {
    timeZone: "Europe/Paris",
    disabled: domifaConfig().envId !== "prod" && !isCronEnabled(),
  })
  protected async loadOpenDataPlaces() {
    await loadDomifaData();
    await loadSoliguideData();
    await loadMssData();
  }
}

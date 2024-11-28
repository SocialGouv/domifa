import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { loadDomifaData } from "../../load-domifa";
import { loadMssData } from "../../load-mss";
import { loadSoliguideData } from "../../load-soliguide";

@Injectable()
export class UpdateOpenDataPlacesService implements OnModuleInit {
  async onModuleInit() {
    if (domifaConfig().envId === "prod" && isCronEnabled()) {
      await this.loadOpenDataPlaces();
    }
  }

  @Cron("0 06 * * 2", {
    timeZone: "Europe/Paris",
    disabled: domifaConfig().envId !== "prod" && !isCronEnabled(),
  })
  protected async loadOpenDataPlaces() {
    await loadDomifaData();
    await loadSoliguideData();
    await loadMssData();
  }
}

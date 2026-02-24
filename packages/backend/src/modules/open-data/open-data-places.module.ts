import { Module } from "@nestjs/common";
import { LoadDomifaDataService } from "./services/import-data/load-domifa";
import { LoadSoliguideDataService } from "./services/import-data/load-soliguide";
import { LoadMssDataService } from "./services/import-data/load-mss";

@Module({
  providers: [
    LoadDomifaDataService,
    LoadSoliguideDataService,
    LoadMssDataService,
  ],
})
export class OpenDataPlacesModule {}

import { Module } from "@nestjs/common";
import { LoadDomifaDataService } from "./services/import-data/load-domifa";
import { LoadSoliguideDataService } from "./services/import-data/load-soliguide";

@Module({
  providers: [LoadDomifaDataService, LoadSoliguideDataService],
})
export class OpenDataPlacesModule {}

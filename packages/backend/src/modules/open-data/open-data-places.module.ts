import { Module } from "@nestjs/common";
import { UpdateOpenDataPlacesService } from "./services/update-open-data-places/update-open-data-places.service";

@Module({
  providers: [UpdateOpenDataPlacesService],
})
export class OpenDataPlacesModule {}

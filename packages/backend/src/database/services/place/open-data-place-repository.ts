import { OpenDataPlace } from "../../../open-data-places/interfaces/OpenDataPlace.interface";
import { OpenDataPlaceTable } from "../../entities/open-data-place";
import { myDataSource } from "../_postgres";

export const openDataPlaceRepository = myDataSource
  .getRepository<OpenDataPlace>(OpenDataPlaceTable)
  .extend({
    findExistingPlace: async (latitude: number, longitude: number) => {
      return openDataPlaceRepository
        .createQueryBuilder("open_data_places")
        .select(`nom, ville, "domifaStructureId"`)
        .where(
          `source='domifa' and ST_DWithin(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, 400);`,
          {
            longitude,
            latitude,
          }
        )
        .getRawOne();
    },
  });

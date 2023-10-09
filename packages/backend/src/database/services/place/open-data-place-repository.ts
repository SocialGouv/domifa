import { OpenDataPlace } from "../../../open-data-places/interfaces/OpenDataPlace.interface";
import { OpenDataPlaceTable } from "../../entities/open-data-place";
import { myDataSource } from "../_postgres";

export const openDataPlaceRepository = myDataSource
  .getRepository<OpenDataPlace>(OpenDataPlaceTable)
  .extend({
    findExistingPlace: async (latitude: number, longitude: number) => {
      return openDataPlaceRepository
        .createQueryBuilder("open_data_places")
        .select(`nom, ville, "structureId"`)
        .where(
          `source='domifa' and ST_DWithin(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, 250);`,
          {
            longitude,
            latitude,
          }
        )
        .getRawOne();
    },
  });

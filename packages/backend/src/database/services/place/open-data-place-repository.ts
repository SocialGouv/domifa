import { OpenDataPlace } from "../../../modules/open-data-places/interfaces";
import { OpenDataPlaceTable } from "../../entities/open-data-place";
import { myDataSource } from "../_postgres";

export const openDataPlaceRepository = myDataSource
  .getRepository<OpenDataPlace>(OpenDataPlaceTable)
  .extend({
    findExistingPlaceFromDomiFa: async (
      latitude: number,
      longitude: number
    ) => {
      return await openDataPlaceRepository
        .createQueryBuilder("open_data_places")
        // skipcq: JS-R1004
        .select(`*`)
        .where(
          // skipcq: JS-R1004
          `source='domifa' and ST_DWithin(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography, 300);`,
          {
            longitude,
            latitude,
          }
        )
        .getRawOne();
    },
  });

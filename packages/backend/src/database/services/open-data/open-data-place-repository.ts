import { StructureType } from "@domifa/common";
import {
  OpenDataPlace,
  OpenDataSource,
} from "../../../modules/open-data/interfaces";
import { OpenDataPlaceTable } from "../../entities/open-data";
import { myDataSource } from "../_postgres";

export const openDataPlaceRepository = myDataSource
  .getRepository<OpenDataPlace>(OpenDataPlaceTable)
  .extend({
    findNearbyPlaces: async (
      latitude: number,
      longitude: number,
      options?: {
        structureType?: StructureType;
        source?: OpenDataSource;
        maxDistance?: number;
      }
    ) => {
      const maxDistance = options?.maxDistance || 300;

      const query = openDataPlaceRepository
        .createQueryBuilder("open_data_places")
        .select(
          `*, ST_Distance(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
        ) as distance`
        )
        .where(
          `ST_DWithin(
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
            :maxDistance
          )`,
          {
            longitude,
            latitude,
            maxDistance,
          }
        );

      if (options?.source) {
        query.andWhere("open_data_places.source = :source", {
          source: options.source,
        });
      }

      if (options?.structureType) {
        query.andWhere('open_data_places."structureType" = :structureType', {
          structureType: options.structureType,
        });
      }

      return await query.orderBy("distance", "ASC").getRawOne();
    },
  });

import { OpenDataPlace } from "../../interfaces/OpenDataPlace.interface";
import {
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { getStructureType } from "../../functions";

let page = 1;
import axios from "axios";
import { domifaConfig } from "../../../../config";
import { openDataPlaceRepository } from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data-place";
import { cleanAddress, cleanCity, appLogger } from "../../../../util";
import { SoliguidePlace } from "../../interfaces";
let nbResults = 0;
let newPlaces = 0;
let updatedPlaces = 0;

const RESULTS_BY_PAGE = 50;

const getFromSoliguide = async () => {
  let soliguideData: SoliguidePlace[] = [];

  try {
    const response = await axios.post(
      domifaConfig().openDataApps.soliguideUrl,
      {
        categorie: 402,
        placeType: "LIEU",
        location: {
          geoType: "pays",
          geoValue: "france",
        },
        options: {
          limit: RESULTS_BY_PAGE,
          page,
        },
      },
      {
        headers: {
          Authorization: `JWT ${domifaConfig().openDataApps.soliguideToken}`,
        },
      }
    );

    soliguideData = response.data.places;

    if (!nbResults) {
      nbResults = response.data.nbResults;
      appLogger.info(`${nbResults} places to import... `);
    }

    for await (const place of soliguideData) {
      const departement = getDepartementFromCodePostal(
        place.position.codePostal
      );

      const openDataPlace: Partial<OpenDataPlace> = {
        nom: place.name,
        adresse: cleanAddress(place?.position?.adresse),
        codePostal: place.position.codePostal,
        ville: cleanCity(place?.position?.ville),
        departement,
        structureType: getStructureType(place.name),
        region: getRegionCodeFromDepartement(departement),
        latitude: place.position.location.coordinates[1],
        longitude: place.position.location.coordinates[0],
        source: "soliguide",
        mail: place?.entity?.mail?.toString(),
        uniqueId: place.lieu_id.toString(),
        soliguideStructureId: parseInt(place.lieu_id as any, 10),
        software: "other",
      };

      let soliguidePlace = await openDataPlaceRepository.findOneBy({
        source: "soliguide",
        uniqueId: place.lieu_id.toString(),
      });

      const placeExist: OpenDataPlace =
        await openDataPlaceRepository.findExistingPlace(
          openDataPlace.latitude,
          openDataPlace.longitude
        );

      if (placeExist) {
        openDataPlace.domifaStructureId = placeExist.domifaStructureId;
        openDataPlace.software = "domifa";

        await openDataPlaceRepository.update(
          { domifaStructureId: placeExist.domifaStructureId, source: "domifa" },
          { soliguideStructureId: openDataPlace.soliguideStructureId }
        );
      }

      if (!soliguidePlace) {
        newPlaces++;
        soliguidePlace = await openDataPlaceRepository.save(
          new OpenDataPlaceTable(openDataPlace)
        );
      } else {
        updatedPlaces++;
        await openDataPlaceRepository.update(
          {
            source: "soliguide",
            soliguideStructureId: openDataPlace.soliguideStructureId,
          },
          {
            ...openDataPlace,
          }
        );
      }
    }

    if (soliguideData?.length === RESULTS_BY_PAGE) {
      appLogger.warn(
        `Import 'soliguide' data page N°${page} : ${
          soliguideData.length * page
        }/${nbResults}`
      );
      page++;
      await getFromSoliguide();
    } else {
      appLogger.info("✅ Import 'soliguide' data done");
      appLogger.info(`🆕 ${newPlaces} places added`);
      appLogger.info(`🔁 ${updatedPlaces} places updated `);
    }
  } catch (e) {
    console.log(e);
    console.error("[IMPORT] Something happen during soliguide import");
  }
};
export const loadSoliguideData = async () => {
  if (
    !domifaConfig().openDataApps.soliguideUrl ||
    !domifaConfig().openDataApps.soliguideToken
  ) {
    // skipcq: JS-0002
    console.log("[IMPORT DATA] Fail, token or url is not in env");
    return;
  }
  appLogger.info("Import Soliguide start 🏃‍♂️... ");
  await getFromSoliguide();
};

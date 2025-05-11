import { OpenDataPlace } from "../../interfaces/OpenDataPlace.interface";
import {
  findNetwork,
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { getStructureType } from "../../functions";

let page = 1;
import axios from "axios";
import { domifaConfig } from "../../../../config";
import { openDataPlaceRepository } from "../../../../database";
import { OpenDataPlaceTable } from "../../../../database/entities/open-data";
import { cleanCity, appLogger, cleanSpaces } from "../../../../util";
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
        category: "domiciliation",
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

      const services = place.services_all.filter(
        (service) => service.category === "domiciliation"
      );

      const service = services[0];

      const openDataPlace: Partial<OpenDataPlace> = {
        createdAt: place.createdAt,
        updatedAt: place.updatedAt,
        nom: cleanSpaces(place.name),
        adresse: place?.position?.adresse,
        codePostal: place.position.codePostal,
        ville: cleanCity(place?.position?.ville),
        departement,
        structureType: getStructureType(place.name),
        region: getRegionCodeFromDepartement(departement),
        latitude: place.position.location.coordinates[1],
        longitude: place.position.location.coordinates[0],
        source: "soliguide",
        mail: place?.entity?.mail?.toString(),
        soliguideStructureId: parseInt(place.lieu_id as any, 10),
        software: "other",
        saturation: service?.saturated?.status,
        saturationDetails: service?.saturated?.precision,
        reseau: findNetwork(cleanSpaces(place.name)),
      };

      const soliguidePlace = await openDataPlaceRepository.findOneBy({
        source: "soliguide",
        soliguideStructureId: openDataPlace.soliguideStructureId,
      });

      const domifaPlaceExist: OpenDataPlace =
        await openDataPlaceRepository.findNearbyPlaces(
          openDataPlace.latitude,
          openDataPlace.longitude,
          {
            source: "domifa",
            maxDistance: 300,
          }
        );

      if (domifaPlaceExist) {
        openDataPlace.domifaStructureId = domifaPlaceExist.domifaStructureId;
        openDataPlace.software = "domifa";

        await openDataPlaceRepository.update(
          {
            domifaStructureId: domifaPlaceExist.domifaStructureId,
          },
          {
            soliguideStructureId: openDataPlace.soliguideStructureId,
            saturation: service.saturated.status,
            saturationDetails: service.saturated.precision,
            reseau: openDataPlace.reseau,
            nbDomiciliesDomifa: openDataPlace.nbDomiciliesDomifa,
            software: "domifa",
          }
        );
      }

      if (!soliguidePlace) {
        newPlaces++;
        await openDataPlaceRepository.save(
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
            reseau: openDataPlace.reseau,
          }
        );
      }

      await openDataPlaceRepository.update(
        {
          soliguideStructureId: openDataPlace.domifaStructureId,
        },
        {
          saturation: service.saturated.status,
          saturationDetails: service.saturated.precision,
          reseau: openDataPlace.reseau,
        }
      );
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
    appLogger.error(e);
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

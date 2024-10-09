import axios from "axios";
import { domifaConfig } from "../config";
import { OpenDataPlaceTable } from "../database/entities/open-data-place";
import { SoliguidePlace } from "./interfaces/SoliguidePlace.interface";
import { openDataPlaceRepository } from "../database/services/place/open-data-place-repository";
import { appLogger, cleanAddress, cleanCity } from "../util";

import { OpenDataPlace } from "./interfaces/OpenDataPlace.interface";
import {
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { getStructureType } from "./functions";

let page = 1;
let nbResults = 0;
let newPlaces = 0;
let updatedPlaces = 0;

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
          limit: 50,
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
    nbResults = response.data.nbResults;

    for await (const place of soliguideData) {
      let soliguidePlace = await openDataPlaceRepository.findOneBy({
        source: "soliguide",
        uniqueId: place.lieu_id.toString(),
      });

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
      };

      if (!soliguidePlace) {
        newPlaces++;
        soliguidePlace = await openDataPlaceRepository.save(
          new OpenDataPlaceTable({
            ...openDataPlace,
            uniqueId: place.lieu_id.toString(),
            soliguideStructureId: parseInt(place.lieu_id as any, 10),
            software: "other",
          })
        );
      } else {
        updatedPlaces++;
        await openDataPlaceRepository.update(
          {
            source: "soliguide",
            uniqueId: place.lieu_id.toString(),
          },
          {
            ...openDataPlace,
          }
        );
      }

      const placeExist: OpenDataPlace =
        await openDataPlaceRepository.findExistingPlace(
          soliguidePlace.latitude,
          soliguidePlace.longitude
        );

      if (placeExist) {
        await openDataPlaceRepository.update(
          { uuid: soliguidePlace.uuid },
          {
            domifaStructureId: placeExist.domifaStructureId,
            software: "domifa",
          }
        );

        await openDataPlaceRepository.update(
          { domifaStructureId: placeExist.domifaStructureId },
          { soliguideStructureId: soliguidePlace.soliguideStructureId }
        );
      }
    }

    if (soliguideData.length * page < nbResults) {
      appLogger.warn(
        `Import 'soliguide' data page N°${page} : ${
          soliguideData.length * page
        }/${nbResults}`
      );
      page++;
      await getFromSoliguide();
    } else {
      appLogger.info("Import 'soliguide' data done ✅");
      appLogger.info(
        `${updatedPlaces} places updated / ${newPlaces} places imported`
      );
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

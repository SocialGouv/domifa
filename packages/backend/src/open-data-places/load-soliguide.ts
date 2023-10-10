import axios from "axios";
import { domifaConfig } from "../config";
import { OpenDataPlaceTable } from "../database/entities/open-data-place";
import { SoliguidePlace } from "./interfaces/SoliguidePlace.interface";
import { departementHelper } from "../structures/services";
import { openDataPlaceRepository } from "../database/services/place/open-data-place-repository";
import { appLogger, cleanAddress, cleanCity } from "../util";

import { OpenDataPlace } from "./interfaces/OpenDataPlace.interface";

let page = 1;
let nbResults = 0;

export const loadSoliguideData = async () => {
  if (
    !domifaConfig().openDataApps.soliguideUrl ||
    !domifaConfig().openDataApps.soliguideToken
  ) {
    console.log("[IMPORT DATA] Fail, token or url is not in env");
    return;
  }
  appLogger.info("Import Soliguide start 🏃‍♂️... ");
  await getFromSoliguide();
};

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

      if (!soliguidePlace) {
        const departement = departementHelper.getDepartementFromCodePostal(
          place.position.codePostal
        );

        soliguidePlace = await openDataPlaceRepository.save(
          new OpenDataPlaceTable({
            nom: place.name,
            adresse: cleanAddress(place?.position?.adresse),
            codePostal: place.position.codePostal,
            ville: cleanCity(place?.position?.ville),
            departement,
            region: departementHelper.getRegionCodeFromDepartement(departement),
            software: "other",
            latitude: place.position.location.coordinates[1],
            longitude: place.position.location.coordinates[0],
            source: "soliguide",
            uniqueId: place.lieu_id.toString(),
          })
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
          { structureId: placeExist.structureId }
        );
      }
    }

    if (soliguideData.length >= 50) {
      appLogger.warn(
        "Import 'soliguide' data page N°" +
          page +
          " : " +
          soliguideData.length * page +
          "/" +
          nbResults
      );
      page++;
      await getFromSoliguide();
    } else {
      appLogger.info("Import 'soliguide' data done ✅");
    }
  } catch (e) {
    console.log(e);
    console.error("[IMPORT] Something happen during soliguide import");
  }
};

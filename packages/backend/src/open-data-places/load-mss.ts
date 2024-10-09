import axios from "axios";
import { domifaConfig } from "../config";
import { OpenDataPlaceTable } from "../database/entities/open-data-place";

import { openDataPlaceRepository } from "../database/services/place/open-data-place-repository";
import { appLogger, cleanAddress, cleanCity } from "../util";

import { OpenDataPlace } from "./interfaces/OpenDataPlace.interface";
import {
  getDepartementFromCodePostal,
  getRegionCodeFromDepartement,
} from "@domifa/common";
import { MssPlace } from "./interfaces";
import { getLocation } from "../structures/services/location.service";
import { getStructureType } from "./functions";

const getFromMss = async () => {
  let newPlaces = 0;
  let updatedPlaces = 0;
  try {
    const response = await axios.get<MssPlace[]>(
      domifaConfig().openDataApps.mssUrl,
      {
        headers: {
          Authorization: `Bearer ${domifaConfig().openDataApps.mssToken}`,
        },
      }
    );

    for await (const place of response.data) {
      const postalCode = place.zipcode.replace(/\W/g, "");
      const address = `${place.address}, ${postalCode}`;
      const position = await getLocation(address);

      if (!position) {
        appLogger.warn(`Adresse not found ${address}`);
        continue;
      }

      const departement = getDepartementFromCodePostal(postalCode);
      const openDataPlace: Partial<OpenDataPlace> = {
        nom: place.name,
        adresse: cleanAddress(place?.address),
        codePostal: postalCode,
        ville: cleanCity(place?.city),
        departement,
        structureType: getStructureType(place.name),
        region: getRegionCodeFromDepartement(departement),
        latitude: position.coordinates[1],
        longitude: position.coordinates[0],
        source: "mss",
        mail: null,
      };

      let mssPlace = await openDataPlaceRepository.findOneBy({
        source: "mss",
        uniqueId: place.id.toString(),
      });

      if (!mssPlace) {
        newPlaces++;

        mssPlace = await openDataPlaceRepository.save(
          new OpenDataPlaceTable({
            ...openDataPlace,
            uniqueId: place.id.toString(),
            mssId: place.id,
            software: "mss",
          })
        );
      } else {
        updatedPlaces++;
        await openDataPlaceRepository.update(
          {
            source: "mss",
            uniqueId: mssPlace.mssId.toString(),
          },
          {
            ...openDataPlace,
          }
        );
      }

      const placeExist: OpenDataPlace =
        await openDataPlaceRepository.findExistingPlace(
          mssPlace.latitude,
          mssPlace.longitude
        );

      if (placeExist) {
        await openDataPlaceRepository.update(
          { uuid: mssPlace.uuid },
          {
            domifaStructureId: placeExist.domifaStructureId,
            software: "domifa",
          }
        );

        await openDataPlaceRepository.update(
          { domifaStructureId: placeExist.domifaStructureId },
          { mssId: mssPlace.mssId }
        );
      }
    }
    appLogger.info(
      `${updatedPlaces} places updated / ${newPlaces} places imported`
    );
    appLogger.info("Import 'Mon suivi social' data done ✅");
  } catch (e) {
    appLogger.error(
      "[IMPORT] Something happen during 'Mon suivi social' import",
      e
    );
  }
};

export const loadMssData = async () => {
  if (
    !domifaConfig().openDataApps.mssUrl ||
    !domifaConfig().openDataApps.mssToken
  ) {
    appLogger.info("[IMPORT DATA MSS] Fail, token or url is not in env");
    return;
  }
  appLogger.info("Import MSS start 🏃‍♂️... ");
  await getFromMss();
};
